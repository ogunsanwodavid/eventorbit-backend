import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import { IUser, User } from "../../mongoose/models/user";

import sendAccountDisabledEmail from "../../utils/helpers/account/sendAccountDisabledEmail";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

type UpdateAccountPayload = {
  password: string;
};

const disableAccount = async (
  req: Request<{}, {}, UpdateAccountPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId, email } = (req as any)["user"] as IUser;

  //Destructure user's new eamil from body
  const { password } = req.body;

  try {
    //Find user by the id
    const user = await User.findById(userId);

    //Return error if user not found
    if (!user) return res.status(404).json({ message: "User not found" });

    //Return error if password not found in user object
    if (!user.password)
      return res.status(404).json({ message: "Password is required" });

    //Compare passwords
    //Return error if invalid
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    //Update user's account disabled
    user.isDisabled = true;
    await user.save();

    //Generate verification token
    const token = jwt.sign({ userId }, jwtSecret, {
      expiresIn: "1d",
    });

    //Send account disabled mail to new email
    await sendAccountDisabledEmail(email);

    //Parse user's object as req for the next function
    (req as any).user = user;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to disable account" });
  }
};

export default disableAccount;
