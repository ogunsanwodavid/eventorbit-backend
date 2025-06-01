import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

import { fileTypeFromBuffer } from "file-type";

import { uploadStream } from "../../config/cloudinary";

const uploadCoverPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  //Check if file exists
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  //Validate magic numbers (security)
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

    //Generate public ID and folder path
    const publicId = `user-${userId}-profile`;
    const folder = "cover-photos";

    //Upload to Cloudinary using your existing utility
    const secureUrl = await uploadStream(req.file.buffer, folder, {
      public_id: publicId,
      overwrite: true,
    });

    //Update profile's cover photo URL
    await Profile.updateOne(
      { userId },
      {
        $set: {
          "images.coverPhoto": secureUrl,
        },
      }
    );

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload cover photo" });
  }
};

export default uploadCoverPhoto;
