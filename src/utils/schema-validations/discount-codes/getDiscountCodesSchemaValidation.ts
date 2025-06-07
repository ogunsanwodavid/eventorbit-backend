import { z } from "zod";

import validateSchema from "../validateSchema";

const getDiscountCodesSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
});

const getDiscountCodesSchemaValidation = validateSchema(getDiscountCodesSchema);

export type GetDiscountCodesInput = z.infer<typeof getDiscountCodesSchema>;

export default getDiscountCodesSchemaValidation;
