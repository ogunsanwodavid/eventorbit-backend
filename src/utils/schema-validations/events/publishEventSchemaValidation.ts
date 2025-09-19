import { z } from "zod";

import validateSchema from "../validateSchema";

const publishEventSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
});

const publishEventSchemaValidation = validateSchema(publishEventSchema);

export type PublishEventInput = z.infer<typeof publishEventSchema>;

export default publishEventSchemaValidation;
