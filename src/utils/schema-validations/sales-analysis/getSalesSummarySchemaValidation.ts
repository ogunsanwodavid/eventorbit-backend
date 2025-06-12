import { z } from "zod";

import validateSchema from "../validateSchema";

const getSalesSummarySchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const getSalesSummarySchemaValidation = validateSchema(getSalesSummarySchema);

export type GetSalesSummaryInput = z.infer<typeof getSalesSummarySchema>;

export default getSalesSummarySchemaValidation;
