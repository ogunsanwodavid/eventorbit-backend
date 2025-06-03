import { z } from "zod";

import validateSchema from "../validateSchema";

import TimeSlotSchema from "./TimeSlotSchema";

const updateEventDurationSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
  body: TimeSlotSchema,
});

const updateEventDurationSchemaValidation = validateSchema(
  updateEventDurationSchema
);

export type UpdateEventDurationInput = z.infer<
  typeof updateEventDurationSchema
>;

export default updateEventDurationSchemaValidation;
