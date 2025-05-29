import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EmailPreferences } from "../../mongoose/models/emailPreferences";

type UpdateEmailPreferencesPayload = {
  allEmails: {
    unsubscribe: boolean;
  };
  confirmationEmails: {
    tickets: boolean;
  };
  bookingEmails: {
    eventReminder: boolean;
    cancellationAndRefund: boolean;
    paymentIssues: boolean;
    ticketTransfer: boolean;
    waitlistNotis: boolean;
  };
  accountEmails: {
    yourAccount: boolean;
    messages: boolean;
  };
  hostEmails: {
    bookingNotis: boolean;
    yourEvent: boolean;
  };
  marketingEmails: {
    weeklyUpdates: boolean;
    others: boolean;
  };
};

const updateEmailPreferences = async (
  req: Request<{}, {}, UpdateEmailPreferencesPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  //Destructure request body for useful parameters
  const {
    allEmails,
    confirmationEmails,
    bookingEmails,
    accountEmails,
    hostEmails,
    marketingEmails,
  } = req.body;

  try {
    //Check if email pref exists
    const emailPreferences = await EmailPreferences.findOne({ userId });

    //Return error if email pref not found
    if (!emailPreferences) {
      res.status(404).json({ message: "Email preferences not found" });
      return;
    }

    //Update info
    await EmailPreferences.updateOne(
      { userId },
      {
        $set: {
          allEmails,
          confirmationEmails,
          bookingEmails,
          accountEmails,
          hostEmails,
          marketingEmails,
        },
      }
    );

    next();
  } catch (error) {
    console.error("Profile info update error:", error);
    res.status(500).json({ message: "Failed to update profile info" });
  }
};

export default updateEmailPreferences;
