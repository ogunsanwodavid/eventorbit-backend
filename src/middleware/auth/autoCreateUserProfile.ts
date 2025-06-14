import { Request, Response, NextFunction } from "express";

import { IUser } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

import generateProfileSlug from "../../utils/helpers/auth/generateProfileSlug";

const autoCreateUserProfile = async (
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

    let profileSlug = generateProfileSlug(user);
    let attempt = 0;

    while (await Profile.exists({ "info.profileSlug": profileSlug })) {
      profileSlug = generateProfileSlug(user);
      if (++attempt > 5) throw new Error("Slug generation failed");
    }

    await Profile.create({
      userId: user._id,
      info: {
        firstName: user.firstName,
        lastName: user.lastName,
        organizationName: user.organizationName,
        userType: user.userType,
        profileSlug,
      },
      images: {
        profilePicture: user.profilePicture,
      },
    });

    next();
  } catch (error) {
    console.error(error);
    next(new Error("Failed to auto create profile"));
  }
};

export default autoCreateUserProfile;
