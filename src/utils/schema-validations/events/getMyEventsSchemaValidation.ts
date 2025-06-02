import { z } from "zod";

import validateSchema from "../validateSchema";

const getMyEventsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.enum(["live", "drafted", "expired"]).optional(),
    search: z.string().trim().min(1).optional(),
    sort: z
      .enum(["newest", "oldest", "name-asc", "name-desc"])
      .default("newest"),
  }),
});

const getMyEventsSchemaValidation = validateSchema(getMyEventsSchema);

export type GetMyEventsInput = z.infer<typeof getMyEventsSchema>;

export default getMyEventsSchemaValidation;
