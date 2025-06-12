import { Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { TicketModel } from "../../mongoose/models/ticket";

import { GetTicketsSalesSummaryInput } from "../../utils/schema-validations/sales-analysis.ts/getTicketsSalesSummarySchemaValidation";

const getTicketsSalesSummary = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as GetTicketsSalesSummaryInput["params"];

    //Validate event ID format
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid event ID format",
      });
    }

    //Find event and verify ownership using hostId
    const event: any = await EventModel.findOne({
      _id: eventId,
      hostId: user._id,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have permission",
      });
    }

    //Get all tickets for the event
    const tickets: any[] = await TicketModel.find({ eventId }).lean();

    if (tickets.length === 0) {
      return res.status(200).json({
        message: "No tickets found for this event",
        data: {},
      });
    }

    //Create date range from first day to today
    const startDate = new Date(event.createdAt!);
    const endDate = new Date();
    startDate.setHours(0, 0, 0, 0); //Normalize to start of day
    endDate.setHours(23, 59, 59, 999); //Normalize to end of day

    //Initialize daily summary
    const dailySummary: Record<string, Record<string, number>> = {};
    const ticketTypes = new Set<string>();

    //Get all unique ticket types
    tickets.forEach((ticket) => {
      ticketTypes.add(ticket.name);
    });

    //Initialize each day with all ticket types set to 0
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0]; //Format as YYYY-MM-DD
      dailySummary[dateKey] = {};

      ticketTypes.forEach((type) => {
        dailySummary[dateKey][type] = 0;
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    //Count tickets per day
    tickets.forEach((ticket) => {
      const ticketDate = new Date(ticket.createdAt!);
      const dateKey = ticketDate.toISOString().split("T")[0]; //Format as YYYY-MM-DD

      if (dailySummary[dateKey]) {
        dailySummary[dateKey][ticket.name] =
          (dailySummary[dateKey][ticket.name] || 0) + 1;
      }
    });

    res.status(200).json({
      message: "Tickets sales summary fetched successfully",
      data: dailySummary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch tickets sales summary",
    });
  }
};

export default getTicketsSalesSummary;
