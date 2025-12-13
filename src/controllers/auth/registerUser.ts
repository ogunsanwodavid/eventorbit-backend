import { NextFunction, Request, Response } from "express";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import { IUser, User } from "../../mongoose/models/user";

import { sendVerificationEmail } from "../../utils/helpers/auth/sendVerificationEmail";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

//Register User props
interface RegisterUserProps extends IUser {
  latitude?: number;
  longitude?: number;
  pageRedirect?: string;
}

//Register user function
const registerUser = async (
  req: Request<{}, {}, RegisterUserProps>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Destructure the values in the request body
    const {
      userType,
      firstName,
      lastName,
      organizationName,
      email,
      password,
      pageRedirect,
    } = req.body;

    //Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use." });

    //Make sure password is required
    if (!password)
      return res.status(400).json({ message: "Password is required" });

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create user
    const newUser = await User.create({
      userType,
      firstName,
      lastName,
      organizationName,
      email,
      password: hashedPassword,
    });

    //Generate verification token
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: "1d",
    });

    // Send verification email
    await sendVerificationEmail(req, email, token, pageRedirect);

    //Parse user's object as req for the next function
    (req as any).user = newUser;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export default registerUser;
