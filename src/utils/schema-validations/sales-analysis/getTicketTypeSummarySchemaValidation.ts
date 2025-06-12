import { z } from "zod";

import validateSchema from "../validateSchema";

const getTicketTypeSummarySchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const getTicketTypeSummarySchemaValidation = validateSchema(
  getTicketTypeSummarySchema
);

export type GetTicketTypeSummaryInput = z.infer<
  typeof getTicketTypeSummarySchema
>;

export default getTicketTypeSummarySchemaValidation;
