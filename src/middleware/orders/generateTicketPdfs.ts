import { Request, Response, NextFunction } from "express";

import { FormattedTicket } from "./formatTickets";

import pdfService from "../../services/tickets/ticketPdf.service";

async function generateTicketPdfs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    //Get formatted tickets from request
    const formattedTickets: FormattedTicket[] = (req as any).formattedTickets;

    if (!formattedTickets?.length) {
      return res.status(400).json({ message: "No tickets to generate" });
    }

    //Generate merged PDF
    const pdfBuffer = await pdfService.generateTicketPdf(formattedTickets);

    //Attach pdfBuffer to request
    (req as any).pdfBuffer = pdfBuffer;

    next();
  } catch (error) {
    console.error("Ticket pdf generation error", error);
    next(error);
  }
}

export default generateTicketPdfs;
