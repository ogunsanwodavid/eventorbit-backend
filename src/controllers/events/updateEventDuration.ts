import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { UpdateEventDurationInput } from "../../utils/schema-validations/events/updateEventDurationSchemaValidation";

const updateEventDuration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as UpdateEventDurationInput["params"];

    //Event data from request body
    const updateData = req.body as UpdateEventDurationInput["body"];

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

    //Return error if event isn't regular
    if (event.type !== "regular") {
      return res.status(403).json({
        message: "Only regular events can update duration",
      });
    }

    //Apply updates
    event.duration = updateData;

    //Save updated event
    await event.save();

    res.status(200).json({
      message: "Event duration updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to update event duration",
    });
  }
};

export default updateEventDuration;
