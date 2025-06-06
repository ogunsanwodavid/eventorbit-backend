import { z } from "zod";

import validateSchema from "../validateSchema";

const getProfileBySlugSchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
});

const getProfileBySlugSchemaValidation = validateSchema(getProfileBySlugSchema);

export type GetProfileBySlugInput = z.infer<typeof getProfileBySlugSchema>;

export default getProfileBySlugSchemaValidation;
