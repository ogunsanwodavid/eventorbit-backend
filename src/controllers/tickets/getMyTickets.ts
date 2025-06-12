import { Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { ITicket, TicketModel } from "../../mongoose/models/ticket";

import { GetMyTicketsInput } from "../../utils/schema-validations/tickets/getMyTicketsSchemaValidation";

const getMyTickets = async (req: Request<any>, res: Response): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //User id
    const userId = user._id as String;

    //Get query parameters from query
    const queryParams = (req as any).query as GetMyTicketsInput["query"];

    //Pagination info
    const upcomingPage = queryParams.upcomingPage || 1;
    const pastPage = queryParams.pastPage || 1;
    const limit = queryParams.limit || 5;

    //Find all tickets for the user
    const tickets = await TicketModel.find({
      buyerId: userId,
    })
      .sort({ startDate: 1 }) //Sort by startDate ascending
      .exec();

    //Categorize tickets by upcoming & past
    const now = new Date();
    const upcomingTickets: ITicket[] = [];
    const pastTickets: ITicket[] = [];

    tickets.forEach((ticket) => {
      if (new Date(ticket.startDate) > now) {
        upcomingTickets.push(ticket);
      } else {
        pastTickets.push(ticket);
      }
    });

    //Sort upcoming tickets (soonest first)
    upcomingTickets.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    //Sort past tickets (most recent first)
    pastTickets.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    //Paginate results
    const paginatedUpcoming = upcomingTickets.slice(
      (upcomingPage - 1) * limit,
      upcomingPage * limit
    );
    const paginatedPast = pastTickets.slice(
      (pastPage - 1) * limit,
      pastPage * limit
    );

    res.status(200).json({
      message: "Your tickets fetched successfully",
      data: {
        upcomingTickets: paginatedUpcoming,
        pastTickets: paginatedPast,
        pagination: {
          upcoming: {
            currentPage: upcomingPage,
            totalPages: Math.ceil(upcomingTickets.length / limit),
            totalItems: upcomingTickets.length,
          },
          past: {
            currentPage: pastPage,
            totalPages: Math.ceil(pastTickets.length / limit),
            totalItems: pastTickets.length,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch your tickets",
    });
  }
};

export default getMyTickets;
