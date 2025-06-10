import { z } from "zod";

import TimeSlotSchema from "./TimeSlotSchema";
import DateStringSchema from "../DateStringSchema";

const ScheduleSchema = z
  .object({
    _id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
      .optional(),
    startDate: DateStringSchema.transform((val) => new Date(val)),
    endDate: DateStringSchema.transform((val) => new Date(val)).optional(),
    timeSlots: z
      .array(TimeSlotSchema)
      .min(1, { message: "At least one time slot is required" }),
    repeatDays: z
      .array(z.enum(["sat", "mon", "tue", "wed", "thu", "fri", "sat"]))
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

    //Ensure end date is after start date
    if (endDate && endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }

    //Additional validation for recurring events
    if (
      (data.repeatDays?.length && !endDate) ||
      (endDate && !data.repeatDays?.length)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring events require an end date",
        path: ["endDate"],
      });
    }
  });

export default ScheduleSchema;
