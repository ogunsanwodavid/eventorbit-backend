import { z } from "zod";

import validateSchema from "../validateSchema";

const updateEventStatusSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
  body: z.object({
    status: z.enum(["live", "expired", "drafted"]),
  }),
});

const updateEventStatusSchemaValidation = validateSchema(
  updateEventStatusSchema
);

export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;

export default updateEventStatusSchemaValidation;
