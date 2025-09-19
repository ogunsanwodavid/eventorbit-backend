import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { PublishEventInput } from "../../utils/schema-validations/events/publishEventSchemaValidation";

const publishEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as PublishEventInput["params"];

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

    //Return error if event isn't drafted
    if (event.status !== "drafted") {
      return res.status(403).json({
        message: "You can only publish drafted events",
      });
    }

    //Update event status to live
    event.status = "live";

    //Save publisned event
    await event.save();

    res.status(200).json({
      message: "Event published successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to publish event",
    });
  }
};

export default publishEvent;
