import { z } from "zod";

import validateSchema from "../validateSchema";

const getMyTicketsSchema = z.object({
  query: z.object({
    upcomingPage: z.coerce.number().int().min(1).default(1).optional(),
    pastPage: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(10).default(5).optional(),
  }),
});

const getMyTicketsSchemaValidation = validateSchema(getMyTicketsSchema);

export type GetMyTicketsInput = z.infer<typeof getMyTicketsSchema>;

export default getMyTicketsSchemaValidation;
