import { z } from "zod";

import validateSchema from "../validateSchema";

const getMyEventsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(30).default(10).optional(),
    status: z.enum(["live", "drafted", "expired"]).optional(),
    search: z.string().trim().min(1).optional(),
    sort: z
      .enum(["newest", "oldest", "name-asc", "name-desc"])
      .default("newest")
      .optional(),
  }),
});

const getMyEventsSchemaValidation = validateSchema(getMyEventsSchema);

export type GetMyEventsInput = z.infer<typeof getMyEventsSchema>;

export default getMyEventsSchemaValidation;
