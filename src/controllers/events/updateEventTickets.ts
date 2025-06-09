import { NextFunction, Request, Response } from "express";

import mongoose, { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { UpdateEventTicketsInput } from "../../utils/schema-validations/events/updateEventTicketsSchemaValidation";

const updateEventTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as UpdateEventTicketsInput["params"];

    //Event data from request body
    const data = req.body as UpdateEventTicketsInput["body"];

    //Get updates and deletion id's arrays
    const { updates, deletionIds } = data.types;

    //Get other parameters from data
    const { urgency, currencies, refundPolicy } = data;

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

    //Instantiate deletion errors array
    const deletionErrors: Array<{
      ticketId: string;
      name: string;
      sold: number;
    }> = [];

    //Kept tickets after checking deletion status
    //::Check if the ticket's id is in the deletionIds array
    //::Prevent deleting sold tickets
    const keptTickets = event.tickets.types.filter((ticket) => {
      if (!ticket._id) return true;

      if (deletionIds && !deletionIds.includes(ticket._id.toString()))
        return true;

      if (ticket.sold > 0) {
        deletionErrors.push({
          ticketId: ticket._id.toString(),
          name: ticket.name,
          sold: ticket.sold,
        });
        return true;
      }
      return false;
    });

    //Return deletion error if any
    if (deletionErrors.length > 0) {
      return res.status(400).json({
        message: "Cannot delete sold tickets",
        errors: deletionErrors,
      });
    }

    //Process updates on the kept tickets
    const updatedTickets = keptTickets.map((ticket) => {
      if (!ticket._id) return ticket;

      //Check if ticket is in the updates array
      const update = updates.find((u) => u._id === ticket._id.toString());
      if (!update) return ticket;

      //Check protected fields
      const protectedFields = ["type", "name"] as const;
      const changedProtected = protectedFields.filter(
        (field) =>
          update[field] !== undefined && update[field] !== ticket[field]
      );

      //Prevent sold tickets from modifying protected fields
      if (ticket.sold > 0 && changedProtected.length > 0) {
        throw new Error(
          `Protected fields modified: ${changedProtected.join(", ")}`
        );
      }

      //Validate quantity
      //::Make sure it more or equal to already sold tickets
      if (update.quantity !== undefined && update.quantity < ticket.sold) {
        throw new Error(
          `Quantity (${update.quantity}) < sold (${ticket.sold})`
        );
      }

      //Preserve number of sold tickets
      return { ...ticket, ...update, sold: ticket.sold };
    });

    //Add new tickets
    const newTickets = updates
      .filter((update) => !update._id)
      .map((update) => ({
        ...update,
        sold: 0,
        _id: new mongoose.Types.ObjectId(), //Generate new ID
      }));

    //Save changes
    event.tickets.types = [...updatedTickets, ...newTickets] as any;
    event.tickets.urgency = urgency;
    event.tickets.currencies = currencies;
    event.tickets.refundPolicy = refundPolicy;

    await event.save();

    return res.status(200).json({
      message: "Tickets updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      message: "Tickets update failed",
    });
  }
};

export default updateEventTickets;
