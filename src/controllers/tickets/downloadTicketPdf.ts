import { Request, Response } from "express";

import { TicketModel } from "../../mongoose/models/ticket";

import { DownloadTicketPdfInput } from "../../utils/schema-validations/tickets/downloadTicketPdfSchemaValidation";

import { FormattedTicket } from "../../middleware/orders/formatTickets";

import formatDate from "../../utils/helpers/orders/formatDate";
import formatTimeZoneToShortForm from "../../utils/helpers/orders/formatTimeZoneToShortForm";

import pdfService from "../../services/tickets/ticketPdf.service";

const downloadTicketPdf = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get ticket code from request params
    const { ticketCode } = req.params as DownloadTicketPdfInput["params"];

    //Find ticket by code
    const ticket = await TicketModel.findOne({ code: ticketCode }).exec();

    //Check ticket exists
    if (!ticket) {
      return res.status(404).json({
        valid: false,
        message: "Ticket not found",
      });
    }

    //Initialize the formatted version of ticket
    let formattedTicket: FormattedTicket;

    //Determine location [venueName, address ] or connectionDetails
    const location =
      ticket.event.location?.venueName && ticket.event.location?.address
        ? `${ticket.event.location?.venueName}, ${ticket.event.location?.address}`
        : ticket.event.location.connectionDetails
        ? `${ticket.event.location.connectionDetails}`
        : "";

    //Format ticket
    formattedTicket = {
      organizerName: ticket.event.organizerName,
      eventCoverPhoto: ticket.event.coverPhoto,
      eventName: ticket.event.name,
      startDate: formatDate(ticket.startDate),
      endDate: formatDate(ticket.endDate),
      timeZone: formatTimeZoneToShortForm(ticket.timeZone),
      location,
      attendeeName: ticket.attendee.name,
      ticketName: ticket.name,
      attendeeEmail: ticket.attendee.email,
      qrCode: ticket.qrCode,
      ticketCode: ticket.code,
    };

    //Generate PDF
    const pdfBuffer = await pdfService.generateTicketPdf([formattedTicket]);

    //Set headers for immediate download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ticket_${ticket.code}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    //Send the PDF buffer
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Ticket Download Error:", error);
    res.status(500).json({
      message: "Failed to downlaod ticket pdf",
    });
  }
};

export default downloadTicketPdf;
