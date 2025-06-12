import { z } from "zod";

import validateSchema from "../validateSchema";

const getTicketsSalesSummarySchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const getTicketsSalesSummarySchemaValidation = validateSchema(
  getTicketsSalesSummarySchema
);

export type GetTicketsSalesSummaryInput = z.infer<
  typeof getTicketsSalesSummarySchema
>;

export default getTicketsSalesSummarySchemaValidation;
