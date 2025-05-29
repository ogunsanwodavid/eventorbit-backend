import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EmailPreferences } from "../../mongoose/models/emailPreferences";

const getEmailPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  try {
    //Check if user's email preferences exists
    const emailPreferences = await EmailPreferences.findOne({ userId });

    //Return error if email pref not found
    if (!emailPreferences) {
      res.status(404).json({ message: "User's email preferences not found" });
      return;
    }

    return res.status(200).json({
      message: "User email preferences fetched successfully",
      emailPreferences,
    });
  } catch (error) {
    console.error("Email preferences fetch error:", error);
    res.status(500).json({ message: "Failed to fetch email preferences" });
  }
};

export default getEmailPreferences;
