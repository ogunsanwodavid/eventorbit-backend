import { NextFunction, Request, Response } from "express";

import { IUser, User, UserType } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

type UpdateProfileInfoPayload = {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  userType: UserType;
  description?: string;
  profileSlug: string;
  isPrivate: boolean;
  isABusinessSeller: boolean;
  businessAddress?: string;
  businessEmail?: string;
  businessPhoneNumber?: string;
};

const updateProfileInfo = async (
  req: Request<{}, {}, UpdateProfileInfoPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  //Destructure request body for useful parameters
  const {
    userType,
    firstName,
    lastName,
    organizationName,
    description,
    profileSlug,
    isPrivate,
    isABusinessSeller,
    businessAddress,
    businessEmail,
    businessPhoneNumber,
  } = req.body;

  try {
    //Check if profile exists
    const profile = await Profile.findOne({ userId });

    //Return error if profile not found
    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    //Check profileSlug uniqueness (if provided and changed)
    if (profileSlug && profileSlug !== profile.info.profileSlug) {
      const existingProfile = await Profile.findOne({
        "info.profileSlug": profileSlug,
      });
      if (existingProfile) {
        res.status(400).json({ message: "Profile slug is already taken" });
        return;
      }
    }

    //Update info
    await Profile.updateOne(
      { userId },
      {
        $set: {
          info: {
            userType,
            firstName,
            lastName,
            organizationName,
            description,
            profileSlug,
            isPrivate,
            isABusinessSeller,
            businessAddress,
            businessEmail,
            businessPhoneNumber,
          },
        },
      }
    );

    //Manual sync of User fields
    const userUpdate: {
      $set: Partial<IUser>;
      $unset?: Record<string, string>;
    } = {
      $set: { userType },
    };

    //::Unset organization name if individual
    if (userType === "individual") {
      userUpdate.$set.firstName = firstName;
      userUpdate.$set.lastName = lastName;
      userUpdate.$unset = { organizationName: "" }; // Explicitly unset
    } //::Unset first and Lastname if organization
    else if (userType === "organization") {
      userUpdate.$set.organizationName = organizationName;
      userUpdate.$unset = { firstName: "", lastName: "" }; // Unset firstName/lastName
    }

    await User.updateOne({ _id: userId }, userUpdate, { maxTimeMS: 5000 });

    next();
  } catch (error) {
    console.error("Profile info update error:", error);
    res.status(500).json({ message: "Failed to update profile info" });
  }
};

export default updateProfileInfo;
