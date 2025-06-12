import { z } from "zod";

import validateSchema from "../validateSchema";

export const findEventsSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    timeFrame: z
      .enum(["today", "this-week", "this-weekend", "next-week"])
      .optional(),
    price: z.enum(["free", "any"]).optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  }),
});

const findEventsSchemaValidation = validateSchema(findEventsSchema);

export type FindEventsInput = z.infer<typeof findEventsSchema>;

export default findEventsSchemaValidation;
