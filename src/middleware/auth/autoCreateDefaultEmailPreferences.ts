import { Request, Response, NextFunction } from "express";

import { IUser } from "../../mongoose/models/user";

import { EmailPreferences } from "../../mongoose/models/emailPreferences";

const autoCreateDefaultEmailPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Get user from request
    const { _id: userId } = (req as any)["user"] as IUser;

    //Default email preferences
    const defaultEmailPreferences = {
      userId,
      allEmails: {
        unsubscribe: false,
      },
      confirmationEmails: {
        tickets: true,
      },
      bookingEmails: {
        eventReminder: true,
        cancellationAndRefund: true,
        paymentIssues: true,
        ticketTransfer: true,
        waitlistNotis: true,
      },
      accountEmails: {
        yourAccount: true,
        messages: true,
      },
      hostEmails: {
        bookingNotis: true,
        yourEvent: true,
      },
      marketingEmails: {
        weeklyUpdates: true,
        others: true,
      },
    };

    await EmailPreferences.create(defaultEmailPreferences);

    next();
  } catch (error) {
    console.error(error);
    next(new Error("Failed to auto create default email preferences"));
  }
};

export default autoCreateDefaultEmailPreferences;
