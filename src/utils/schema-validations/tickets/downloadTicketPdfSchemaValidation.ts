import { z } from "zod";

import validateSchema from "../validateSchema";

const downloadTicketPdfSchema = z.object({
  params: z.object({
    ticketCode: z.string().min(1, "Ticket code is required"),
  }),
});

const downloadTicketPdfSchemaValidation = validateSchema(
  downloadTicketPdfSchema
);

export type DownloadTicketPdfInput = z.infer<typeof downloadTicketPdfSchema>;

export default downloadTicketPdfSchemaValidation;
