import { z } from "zod";

import validateSchema from "../validateSchema";

const deleteEventSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const deleteEventSchemaValidation = validateSchema(deleteEventSchema);

export type DeleteEventInput = z.infer<typeof deleteEventSchema>;

export default deleteEventSchemaValidation;
