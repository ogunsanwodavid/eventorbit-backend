import { z } from "zod";

import validateSchema from "../validateSchema";

import DurationSchema from "./DurationSchema";

const updateEventDurationSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
  body: DurationSchema,
});

const updateEventDurationSchemaValidation = validateSchema(
  updateEventDurationSchema
);

export type UpdateEventDurationInput = z.infer<
  typeof updateEventDurationSchema
>;

export default updateEventDurationSchemaValidation;
