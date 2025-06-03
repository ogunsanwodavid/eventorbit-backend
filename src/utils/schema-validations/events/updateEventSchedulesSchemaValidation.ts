import { z } from "zod";

import validateSchema from "../validateSchema";

import ScheduleSchema from "./ScheduleSchema";

const updateEventSchedulesSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
  body: z.array(ScheduleSchema).min(1),
});

const updateEventSchedulesSchemaValidation = validateSchema(
  updateEventSchedulesSchema
);

export type UpdateEventSchedulesInput = z.infer<
  typeof updateEventSchedulesSchema
>;

export default updateEventSchedulesSchemaValidation;
