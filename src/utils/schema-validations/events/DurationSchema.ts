import { z } from "zod";

const DurationSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    timeZone: z.string().min(1, "Timezone is required"),
  })
  .superRefine((data, ctx) => {
    //Convert string dates to Date objects if needed
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
  });

export default DurationSchema;
