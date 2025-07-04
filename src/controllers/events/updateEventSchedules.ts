import { Request, Response } from "express";

import { isValidObjectId, Types } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel, Schedule } from "../../mongoose/models/event";

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

    //Extract IDs of schedules to keep
    const scheduleIdsToKeep = updateData
      .filter((schedule) => schedule._id && isValidObjectId(schedule._id))
      .map((schedule) => new Types.ObjectId(schedule._id));

    //Check if schedules that have sold tickets are not included in ids to keep
    if (event.schedules) {
      const schedulesWithSoldTickets = event.schedules.filter(
        (schedule) =>
          schedule.sold &&
          schedule.sold > 0 &&
          !scheduleIdsToKeep.some((id) => id.equals(schedule._id))
      );

      //If any exists, throw an error
      if (schedulesWithSoldTickets.length > 0) {
        return res.status(400).json({
          message: "Cannot remove schedules with sold tickets",
        });
      }
    }

    //Prepare bulk operations
    const bulkOps = [
      //Remove schedules not in the updated list
      {
        updateOne: {
          filter: { _id: eventId },
          update: {
            $pull: {
              schedules: {
                _id: { $nin: scheduleIdsToKeep },
              },
            },
          },
        },
      },
      //Handle updates and additions
      ...updateData.map((scheduleUpdate) => {
        //For new schedules
        if (!scheduleUpdate._id || !isValidObjectId(scheduleUpdate._id)) {
          return {
            updateOne: {
              filter: { _id: eventId },
              update: {
                $push: {
                  schedules: {
                    ...scheduleUpdate,
                    _id: new Types.ObjectId(),
                    sold: 0, // Explicit default
                  },
                },
              },
            },
          };
        }

        //For existing schedules
        const scheduleId = new Types.ObjectId(scheduleUpdate._id);
        const updateFields: Record<string, any> = {};

        //Explicitly check and set each possible field
        const possibleFields: (keyof Schedule)[] = [
          "startDate",
          "endDate",
          "timeSlots",
          "repeatDays",
        ];

        possibleFields.forEach((key) => {
          if (key !== "sold" && scheduleUpdate[key] !== undefined) {
            updateFields[`schedules.$.${key}`] = scheduleUpdate[key];
          }
        });

        return {
          updateOne: {
            filter: { _id: eventId, "schedules._id": scheduleId },
            update: { $set: updateFields },
          },
        };
      }),
    ];

    //Execute atomic updates
    await EventModel.bulkWrite(bulkOps);

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
