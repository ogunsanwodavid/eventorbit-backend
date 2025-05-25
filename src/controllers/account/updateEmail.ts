import { NextFunction, Request, RequestHandler, Response } from "express";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import { User } from "../../mongoose/models/user";

import { sendVerificationEmail } from "../../utils/helpers/auth/sendVerificationEmail";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

type UpdateEmailParams = {
  id: string;
};

type UpdateEmailPayload = {
  email: string;
  password: string;
};

const updateEmail = async (
  req: Request<UpdateEmailParams, any, UpdateEmailPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Destructure user's id from the query
  const { id: userId } = req.params;

  //Destructure user's new eamil from body
  const { email: newEmail, password } = req.body;

  try {
    //Find user by the id
    const user = await User.findById(userId);

    //Return error if user not found
    if (!user) return res.status(404).json({ message: "User not found" });

    //Prevent Google accounts from updating emails
    if (user.isGoogle)
      return res.status(403).json({
        message: "You signed up with Google. Email cannot be updated manually.",
      });

    //Check if new email isnt same as before
    if (user.email === newEmail) {
      return res
        .status(400)
        .json({ message: "New email is the same as current email" });
    }

    //Return error if password not found in user object
    if (!user.password)
      return res.status(404).json({ message: "Password is required" });

    //Compare passwords
    //Return error if invalid
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

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
    await sendVerificationEmail(newEmail, token);

    //Parse user's object as req for the next function
    (req as any).user = user;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update email" });
  }
};

export default updateEmail;
