import { z } from "zod";

import TimeSchema from "./TimeSchema";

/* 
const TimeSlotSchema = z
  .object({
    startTime: TimeSchema,
    endTime: TimeSchema,
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime } = data;

    if (
      startTime.hours > endTime.hours ||
      (startTime.hours === endTime.hours &&
        startTime.minutes >= endTime.minutes)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  }); 
  */

const TimeSlotSchema = z.object({
  startTime: TimeSchema,
  duration: z.object({
    value: z.number(),
    unit: z.enum(["hours", "mins"]),
  }),
});

export default TimeSlotSchema;
