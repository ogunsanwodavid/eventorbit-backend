import { Request, Response, NextFunction } from "express";

import { IUser } from "../../mongoose/models/user";

import { EmailPreferences } from "../../mongoose/models/emailPreferences";

const autoCreateDefaultEmailPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Get user and is existing user status from request
    const user = (req as any).user as IUser & { isExistingUser: boolean };
    const { isExistingUser, _id: userId } = user;

    //Go to next middleware if user exists
    if (isExistingUser) return next();

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
