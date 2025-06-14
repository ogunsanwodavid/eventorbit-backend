import { NextFunction, Request, Response } from "express";

import { IUser, User } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

import { fileTypeFromBuffer } from "file-type";

import { uploadStream } from "../../config/cloudinary";

const uploadProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request body
  const { _id: userId } = (req as any).user as IUser;

  //Check if file exists
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  //Validate file type
  const fileType = await fileTypeFromBuffer(req.file.buffer);
  if (!fileType?.mime.match(/^image\/(jpeg|png|webp)$/)) {
    return res.status(400).json({ error: "Only JPEG/PNG/WEBP allowed" });
  }

  try {
    //Check if profile exists
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    //Upload to Cloudinary
    const secureUrl = await uploadStream(
      req.file.buffer,
      "eventorbit/profile-pictures",
      {
        public_id: `user-${userId}-profile`,
        overwrite: true,
      }
    );

    //Update both Profile and User in parallel
    await Promise.all([
      Profile.updateOne(
        { userId },
        { $set: { "images.profilePicture": secureUrl } }
      ),
      User.updateOne(
        { _id: userId },
        { $set: { profilePicture: secureUrl } },
        { maxTimeMS: 5000 }
      ),
    ]);

    next();
  } catch (err) {
    console.error("Profile picture upload failed:", err);
    return res.status(500).json({
      message: "Failed to upload profile picture",
    });
  }
};

export default uploadProfilePicture;
