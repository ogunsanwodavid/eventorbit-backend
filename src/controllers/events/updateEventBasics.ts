import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { UpdateEventBasicsInput } from "../../utils/schema-validations/events/updateEventBasicsSchemaValidation";

import { generateEventAlias } from "../../utils/helpers/events/generateEventAlias";

const updateEventBasics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as UpdateEventBasicsInput["params"];

    //Event data from request body
    const updateData = req.body as UpdateEventBasicsInput["body"];

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
        status: "fail",
        message: "Event not found or you don't have permission",
      });
    }

    //Check if name is being updated
    const isNameChanged =
      updateData.name && updateData.name !== event.basics.name;

    //Apply updates
    Object.assign(event.basics, updateData);

    //Regenerate new alias if name changed
    if (isNameChanged) {
      event.alias = generateEventAlias(updateData.name);
    }

    //Save and return updated event
    const updatedEvent = await event.save();

    res.status(200).json({
      message: "Event basics updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to update event basics",
    });
  }
};

export default updateEventBasics;
