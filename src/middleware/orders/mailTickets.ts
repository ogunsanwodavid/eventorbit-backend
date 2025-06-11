import { Request, Response, NextFunction } from "express";

import { IUser } from "../../mongoose/models/user";

import { IEvent } from "../../mongoose/models/event";

import { FormattedTicket } from "./formatTickets";

import sendOrderConfirmationEmail from "../../utils/helpers/orders/sendOrderConfirmationEmail";

async function mailTickets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event from request
    const event = (req as any)["event"] as IEvent;

    //Get formatted tickets from request
    const formattedTickets: FormattedTicket[] = (req as any).formattedTickets;

    //Get pdf buffer from request
    const pdfBuffer = (req as any).pdfBuffer;

    if (!formattedTickets?.length) {
      return res.status(400).json({ message: "No tickets to generate" });
    }

    //Send order confirmation mail
    await sendOrderConfirmationEmail(user, event, formattedTickets, pdfBuffer);

    next();
  } catch (error) {
    console.error("Mail tickets error", error);
    next(error);
  }
}

export default mailTickets;
