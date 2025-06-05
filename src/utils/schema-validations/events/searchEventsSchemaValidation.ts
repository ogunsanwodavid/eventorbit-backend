import { z } from "zod";

import validateSchema from "../validateSchema";

export const searchEventsSchema = z.object({
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

const searchEventsSchemaValidation = validateSchema(searchEventsSchema);

export type SearchEventsInput = z.infer<typeof searchEventsSchema>;

export default searchEventsSchemaValidation;
