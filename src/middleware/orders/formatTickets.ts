import { Request, Response, NextFunction } from "express";

import { ITicket } from "../../mongoose/models/ticket";

import formatDate from "../../utils/helpers/orders/formatDate";

export interface FormattedTicket {
  organizerName: string;
  eventCoverPhoto: string;
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  attendeeName: string;
  ticketName: string;
  attendeeEmail: string;
  qrCode: string;
  ticketCode: string;
}

const formatTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get created tickets from request
    const createdTickets = (req as any).createdTickets as ITicket[];

    //Throw error if no created tickets found
    if (!Array.isArray(createdTickets) || createdTickets.length === 0) {
      throw new Error("No tickets found to format");
    }

    const formattedTickets: FormattedTicket[] = createdTickets.map((ticket) => {
      //Determine location [venueName, address ] or connectionDetails
      const location =
        ticket.event.location?.venueName && ticket.event.location?.address
          ? `${ticket.event.location?.venueName}, ${ticket.event.location?.address}`
          : ticket.event.location.connectionDetails
          ? `${ticket.event.location.connectionDetails}`
          : "";

      return {
        organizerName: ticket.event.organizerName,
        eventCoverPhoto: ticket.event.coverPhoto,
        eventName: ticket.event.name,
        startDate: formatDate(ticket.startDate),
        endDate: formatDate(ticket.endDate),
        location,
        attendeeName: ticket.attendee.name,
        ticketName: ticket.name,
        attendeeEmail: ticket.attendee.email,
        qrCode: ticket.qrCode,
        ticketCode: ticket.code,
      };
    });

    //Attach formatted tickets to request
    (req as any).formattedTickets = formattedTickets;

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export default formatTickets;
