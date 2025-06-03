import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { UpdateEventSchedulesInput } from "../../utils/schema-validations/events/updateEventSchedulesSchemaValidation";

const updateEventSchedules = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as UpdateEventSchedulesInput["params"];

    //Event data from request body
    const updateData = req.body as UpdateEventSchedulesInput["body"];

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

    //Return error if event isn't timed-entry
    if (event.type !== "timed-entry") {
      return res.status(403).json({
        message: "Only timed-entry events can update schedules",
      });
    }

    //Apply updates
    event.schedules = updateData;

    //Save updated event
    await event.save();

    res.status(200).json({
      message: "Event schedules updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to update event schedules",
    });
  }
};

export default updateEventSchedules;
