import { Request, Response, NextFunction } from "express";

import { EventModel, IEvent } from "../../mongoose/models/event";

import { IOrder } from "../../mongoose/models/order";

import { ITicket, TicketModel } from "../../mongoose/models/ticket";

import { ProcessOrderInput } from "../../utils/schema-validations/orders/processOrderSchemaValidation";

const resolveSoldStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get event object from request
    const event = (req as any).event as IEvent;

    //Get duration and tickets from request body
    const { duration, tickets } = req.body as ProcessOrderInput["body"];

    //Get scheduleId if it exists from duration
    const scheduleId = duration?.scheduleId;

    //Update ticket sold quantities
    const ticketUpdates = tickets.map(async (ticket) => {
      const updatedTicket = await EventModel.findOneAndUpdate(
        {
          _id: event._id,
          "tickets.types._id": ticket._id, //Find the event with matching ticket ID
        },
        {
          $inc: { "tickets.types.$[elem].sold": ticket.quantityPurchased },
        },
        {
          new: true,
          arrayFilters: [{ "elem._id": ticket._id }], //Specifically target the matching ticket
        }
      );

      if (!updatedTicket) {
        throw new Error("Ticket not found in event.");
      }

      return updatedTicket;
    });

    //Update schedule capacity if duration has scheduleId
    if (scheduleId) {
      const updatedEvent = await EventModel.findOneAndUpdate(
        {
          _id: event._id,
          "schedules._id": scheduleId,
        },
        {
          $inc: {
            "schedules.$.sold": tickets.reduce(
              (sum, t) => sum + t.quantityPurchased,
              0
            ),
          },
        },
        { new: true }
      );

      if (!updatedEvent) {
        throw new Error("Event or schedule not found");
      }
    }

    // Wait for all updates to complete
    await Promise.all(ticketUpdates);

    next();
  } catch (error) {
    //Get new order from request
    const newOrder = (req as any).newOrder as IOrder;

    //Get created tickets from request body
    const createdTickets = (req as any).createdTickets as ITicket[];

    //Update status to failed
    newOrder.status = "failed";
    await newOrder.save();

    //Delete all tickets
    const ticketIds = createdTickets.map((t) => t._id);
    await TicketModel.deleteMany({ _id: { $in: ticketIds } });

    next(error);
  }
};

export default resolveSoldStatus;
