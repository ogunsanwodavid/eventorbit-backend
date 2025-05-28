import { NextFunction, Request, Response } from "express";

import { IUser, User } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

type UpdateSocialUrlsPayload = {
  website?: string;
  x?: string;
  facebook?: string;
  instagram?: string;
};

const updateProfileSocialUrls = async (
  req: Request<{}, {}, UpdateSocialUrlsPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  //Destructure request body for useful parameters
  const { website, x, facebook, instagram } = req.body;

  try {
    //Check if profile exists
    const profile = await Profile.findOne({ userId });

    //Return error if profile not found
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    //Update info
    await Profile.updateOne(
      { userId },
      {
        $set: {
          socialUrls: {
            website,
            x,
            facebook,
            instagram,
          },
        },
      }
    );

    next();
  } catch (error) {
    console.error("Social URLS update error:", error);
    res.status(500).json({ message: "Failed to update social URLS info" });
  }
};

export default updateProfileSocialUrls;
