import { Request, Response } from "express";

import { isValidObjectId, Types } from "mongoose";

import { EventModel, WeekDay } from "../../mongoose/models/event";

import { IUser } from "../../mongoose/models/user";

import { GetEventTimeSlotsInput } from "../../utils/schema-validations/events/getEventTimeSlotsSchemaValidation";

export interface TimeSlotResult {
  scheduleId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
}

const getEventTimeSlots = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as GetEventTimeSlotsInput["params"];

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
      return res.status(400).json({
        message: "This endpoint is only available for timed-entry events",
      });
    }

    if (!event.schedules || event.schedules.length === 0) {
      return res.status(200).json({
        message: "No schedules found for this event",
      });
    }

    const allTimeslots: TimeSlotResult[] = [];

    //Process each schedule
    for (const schedule of event.schedules) {
      const { startDate, endDate, repeatDays, timeSlots } = schedule;

      //Process each time slot in the schedule
      for (const timeSlot of timeSlots) {
        const { startTime, duration } = timeSlot;
        const durationHours =
          duration.unit === "hours" ? duration.value : duration.value / 60;

        if (!repeatDays || !repeatDays.length || !endDate) {
          //Non-repeating schedule
          const slotStart = new Date(startDate);
          slotStart.setHours(startTime.hours, startTime.minutes, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setHours(slotEnd.getHours() + durationHours);

          allTimeslots.push({
            scheduleId: schedule._id,
            startDate: slotStart,
            endDate: slotEnd,
          });
        } else {
          //Repeating schedule - generate slots for each matching day
          const currentDate = new Date(startDate);
          const finalDate = new Date(endDate);

          while (currentDate <= finalDate) {
            const dayOfWeek = currentDate
              .toLocaleString("en-US", { weekday: "short" })
              .toLowerCase()
              .substring(0, 3);

            if (repeatDays.includes(dayOfWeek as WeekDay)) {
              const slotStart = new Date(currentDate);
              slotStart.setHours(startTime.hours, startTime.minutes, 0, 0);

              const slotEnd = new Date(slotStart);
              slotEnd.setHours(slotEnd.getHours() + durationHours);

              allTimeslots.push({
                scheduleId: schedule._id,
                startDate: slotStart,
                endDate: slotEnd,
              });
            }

            //Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }
    }

    //Sort all timeslots by startDate in ascending order
    allTimeslots.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    res.status(200).json({
      message: "Timeslots retrieved successfully",
      timeslots: allTimeslots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve timeslots",
    });
  }
};

export default getEventTimeSlots;
