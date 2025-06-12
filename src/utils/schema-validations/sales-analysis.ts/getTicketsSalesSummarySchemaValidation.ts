import { z } from "zod";

import validateSchema from "../validateSchema";

const getTicketsSalesSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const getTicketsSalesSchemaValidation = validateSchema(getTicketsSalesSchema);

export type GetTicketsSalesSummaryInput = z.infer<typeof getTicketsSalesSchema>;

export default getTicketsSalesSchemaValidation;
