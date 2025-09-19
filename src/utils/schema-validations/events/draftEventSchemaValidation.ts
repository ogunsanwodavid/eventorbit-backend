import { z } from "zod";

import validateSchema from "../validateSchema";

const draftEventSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
});

const draftEventSchemaValidation = validateSchema(draftEventSchema);

export type DraftEventInput = z.infer<typeof draftEventSchema>;

export default draftEventSchemaValidation;
