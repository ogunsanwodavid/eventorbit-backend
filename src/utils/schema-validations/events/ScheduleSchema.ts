import { z } from "zod";

import TimeSlotSchema from "./TimeSlotSchema";

const DateStringSchema = z.string().refine(
  (val) => {
    return !isNaN(Date.parse(val));
  },
  {
    message: "Invalid date string format",
  }
);

const ScheduleSchema = z
  .object({
    startDate: DateStringSchema.transform((val) => new Date(val)),
    endDate: DateStringSchema.transform((val) => new Date(val)).optional(),
    timeSlots: z
      .array(TimeSlotSchema)
      .min(1, { message: "At least one time slot is required" })
      .superRefine((slots, ctx) => {
        slots.forEach((slot, index) => {
          if (slot.startTime.timeZone !== slot.endTime.timeZone) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Time slot must use consistent timezone",
              path: [index, "endTime", "timeZone"],
            });
          }
        });
      }),
    repeatDays: z
      .array(z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]))
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Convert string dates to Date objects if needed
    const startDate =
      data.startDate instanceof Date
        ? data.startDate
        : new Date(data.startDate);
    const endDate =
      data.endDate instanceof Date
        ? data.endDate
        : data.endDate
        ? new Date(data.endDate)
        : null;

    // Ensure end date is after start date
    if (endDate && endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }

    // Additional validation for recurring events
    if (data.repeatDays?.length && !endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring events require an end date",
        path: ["endDate"],
      });
    }
  });
/* z
  .object({
    startDate: z.date(),
    endDate: z.date().optional(),
    timeSlots: z
      .array(TimeSlotSchema)
      .min(1, { message: "At least one time slot is required" })
      .superRefine((slots, ctx) => {
        slots.forEach((slot, index) => {
          if (slot.startTime.timeZone !== slot.endTime.timeZone) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Time slot must use consistent timezone",
              path: [index, "endTime", "timeZone"],
            });
          }
        });
      }),
    repeatDays: z
      .array(z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]))
      .optional(),
  })
  .superRefine((data, ctx) => {
    //Ensure end date is after start date
    if (data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }

    //Additional validation for recurring events
    if (data.repeatDays?.length && !data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring events require an end date",
        path: ["endDate"],
      });
    }
  }); */

export default ScheduleSchema;
