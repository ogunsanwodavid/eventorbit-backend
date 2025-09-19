import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { DraftEventInput } from "../../utils/schema-validations/events/draftEventSchemaValidation";

const draftEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as DraftEventInput["params"];

    //Validate event ID format
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
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
        message: "Event not found or permission denied",
      });
    }

    //Return error if event isn't live
    if (event.status !== "live") {
      return res.status(403).json({
        message: "You can only draft a live event",
      });
    }

    //Return error if event has sold tickets
    if (event.tickets.hasSoldTickets) {
      return res.status(403).json({
        message: "You can't draft an event that has sold tickets",
      });
    }

    //Update event status to drafted
    event.status = "drafted";

    //Save publisned event
    await event.save();

    res.status(200).json({
      message: "Event drafted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to draft event",
    });
  }
};

export default draftEvent;
