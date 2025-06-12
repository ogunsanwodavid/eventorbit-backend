import { z } from "zod";

import validateSchema from "../validateSchema";

const validateTicketSchema = z.object({
  params: z.object({
    ticketCode: z.string().min(1, "Ticket code is required"),
  }),
});

const validateTicketSchemaValidation = validateSchema(validateTicketSchema);

export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;

export default validateTicketSchemaValidation;
