import { z } from "zod";

import validateSchema from "../validateSchema";

const getCheckoutQuestionsSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
});

const getCheckoutQuestionsSchemaValidation = validateSchema(
  getCheckoutQuestionsSchema
);

export type GetCheckoutQuestionsInput = z.infer<
  typeof getCheckoutQuestionsSchema
>;

export default getCheckoutQuestionsSchemaValidation;
