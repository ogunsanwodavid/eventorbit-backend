import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  try {
    //Check if profile exists
    const profile = await Profile.findOne({ userId });

    //Return error if profile not found
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export default getProfile;
