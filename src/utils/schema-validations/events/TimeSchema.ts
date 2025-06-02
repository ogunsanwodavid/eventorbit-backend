import { z } from "zod";

const TimeSchema = z.object({
  hours: z.coerce.number().min(0).max(23),
  minutes: z.coerce.number().min(0).max(59),
  timeZone: z.string(),
});

export default TimeSchema;
