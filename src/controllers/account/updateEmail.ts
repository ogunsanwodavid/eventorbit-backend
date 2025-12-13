import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import { IUser, User } from "../../mongoose/models/user";

import { sendVerificationEmail } from "../../utils/helpers/auth/sendVerificationEmail";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

type UpdateEmailPayload = {
  email: string;
  password: string;
};

const updateEmail = async (
  req: Request<{}, {}, UpdateEmailPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  //Destructure user's new eamil from body
  const { email: newEmail, password } = req.body;

  try {
    //Find user by the id
    const user = await User.findById(userId);

    //Return error if user not found
    if (!user) return res.status(404).json({ message: "User not found" });

    //Prevent Google sign up accounts without passwords from updating emails
    if (user.isGoogle && !user.password)
      return res.status(403).json({
        message: "You signed up with Google. Set up a password first.",
      });

    //Return error if password not found in user object
    if (!user.password)
      return res
        .status(404)
        .json({ message: "You don't have a set current password" });

    //Compare passwords
    //Return error if invalid
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    //Check if email is used
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    //Check if new email isnt same as before
    if (user.email === newEmail) {
      return res
        .status(400)
        .json({ message: "New email is the same as current email" });
    }

    //Update user's email with new one
    //Make email unverified
    user.email = newEmail;
    user.isVerified = false;

    await user.save();

    //Generate verification token
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: "1d",
    });

    //Send verification email to new email
    await sendVerificationEmail(req, newEmail, token);

    //Parse user's object as req for the next function
    (req as any).user = user;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update email" });
  }
};

export default updateEmail;
