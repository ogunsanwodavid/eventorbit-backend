import { z } from "zod";

import validateSchema from "../validateSchema";

const getEventByAliasSchema = z.object({
  params: z.object({
    alias: z.string(),
  }),
});

const getEventByAliasSchemaValidation = validateSchema(getEventByAliasSchema);

export type GetEventByAliasInput = z.infer<typeof getEventByAliasSchema>;

export default getEventByAliasSchemaValidation;
