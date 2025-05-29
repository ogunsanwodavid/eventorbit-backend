import { NextFunction, Request, Response } from "express";

import { v2 as cloudinary } from "cloudinary";

import { fileTypeFromBuffer } from "file-type";

import { IUser, User } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

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

    //Return error if profile not found
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    //Upload to Cloudinary with filename structure of (user-[ID]-profile)
    const publicId = `user-${userId}-profile`;

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "cover-photos",
            public_id: publicId,
            overwrite: true, // Replace if exists
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        )
        .end(req.file!.buffer);
    });

    //Update user's cover photo URL
    //Update image
    await Profile.updateOne(
      { userId },
      {
        $set: {
          "images.coverPhoto": result.secure_url,
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
