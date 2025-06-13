import { z } from "zod";

import validateSchema from "../validateSchema";

const getRandomEventsSchema = z.object({
  query: z.object({
    amount: z.coerce.number().int().nonnegative().default(5),
  }),
});

const getRandomEventsSchemaValidation = validateSchema(getRandomEventsSchema);

export type GetRandomEventsInput = z.infer<typeof getRandomEventsSchema>;

export default getRandomEventsSchemaValidation;
