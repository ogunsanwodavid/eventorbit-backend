import { z } from "zod";

import validateSchema from "../validateSchema";

const getRecentlyUpdatedSchema = z.object({
  query: z.object({
    number: z.coerce.number().int().min(3).default(3).optional(),
  }),
});

const getRecentlyUpdatedSchemaValidation = validateSchema(
  getRecentlyUpdatedSchema
);

export type GetRecentlyUpdatedInput = z.infer<typeof getRecentlyUpdatedSchema>;

export default getRecentlyUpdatedSchemaValidation;
