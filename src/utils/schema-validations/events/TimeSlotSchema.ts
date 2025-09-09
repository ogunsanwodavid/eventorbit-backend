import { z } from "zod";

import TimeSchema from "./TimeSchema";

const TimeSlotSchema = z.object({
  startTime: TimeSchema,
  duration: z.object({
    value: z.number(),
    unit: z.enum(["hours", "mins"]),
  }),
});

export default TimeSlotSchema;
