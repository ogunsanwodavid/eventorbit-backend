import { NextFunction, Request, Response } from "express";

import { v2 as cloudinary } from "cloudinary";

import multer from "multer";

import { fileTypeFromBuffer } from "file-type";

import { IUser, User } from "../../mongoose/models/user";

import { Profile } from "../../mongoose/models/profile";

//Configure Multer (stores file in memory temporarily)
//::Accept only jpeg, png and webp images
//::Restrict file size to 5MB
//Middleware to handle file upload
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    cb(null, validTypes.includes(file.mimetype));
  },
}).single("profilePicture");

const uploadProfilePicture = async (
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
            folder: "profile-pictures",
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

    //Update user's profile picture URL
    //Update images
    await Profile.updateOne(
      { userId },
      {
        $set: {
          images: {
            profilePicture: result.secure_url,
          },
        },
      }
    );

    //Manual sync of User fields
    const userUpdate: {
      $set: Partial<IUser>;
      $unset?: Record<string, string>;
    } = {
      $set: { profilePicture: result.secure_url },
    };

    //Set profilePicture on user object
    //::If cloudinary gives correct url
    if (result.secure_url) {
      userUpdate.$set.profilePicture = result.secure_url;
    }

    await User.updateOne({ _id: userId }, userUpdate, { maxTimeMS: 5000 });

    next();
  } catch (err) {
    console.error(err);

    return res
      .status(500)
      .json({ message: "Failed to upload profile picture" });
  }
};

export default uploadProfilePicture;
