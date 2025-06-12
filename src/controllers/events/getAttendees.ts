import { Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { TicketModel, TicketStatus } from "../../mongoose/models/ticket";

import { GetAttendeesInput } from "../../utils/schema-validations/events/getAttendeesSchemaValidation";

export interface Attendee {
  name: string;
  email: string;
  ticketType: string;
  dateAttending: Date;
  value: number;
  currency: string;
  status: TicketStatus;
}

const getAttendees = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as GetAttendeesInput["params"];

    //Validate event ID format
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid event ID format",
      });
    }

    //Find event and verify ownership using hostId
    const event = await EventModel.findOne({
      _id: eventId,
      hostId: user._id,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have permission",
      });
    }

    //Get query parameters from query
    const queryParams = (req as any).query as GetAttendeesInput["query"];

    //Pagination info
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 20;
    const skip = (page - 1) * limit;

    //Filters
    const search = queryParams?.search;
    const sort = queryParams?.sort || "desc";

    //Build DB query filters
    const filter: any = { eventId };

    //Handle search filter
    //Search in tickets' attendee name and email
    if (search) {
      filter.$or = [
        { "attendee.name": { $regex: search, $options: "i" } },
        { "attendee.email": { $regex: search, $options: "i" } },
      ];
    }

    //Handle sort filter
    const sortOptions: any = {
      startDate: sort === "asc" ? 1 : -1,
    };

    //Get all matching tickets with pagination
    const [tickets, total] = await Promise.all([
      TicketModel.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      TicketModel.countDocuments(filter),
    ]);

    //Get attendees from tickets
    const attendees: Attendee[] = tickets.map((ticket) => {
      return {
        name: ticket.attendee.name,
        email: ticket.attendee.email,
        ticketType: ticket.name,
        dateAttending: ticket.startDate,
        value: ticket.value,
        currency: ticket.currency,
        status: ticket.status,
      };
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      data: {
        attendees,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
    });
  }
};

export default getAttendees;
