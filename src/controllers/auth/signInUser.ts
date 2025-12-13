import { NextFunction, Request, Response } from "express";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import { User } from "../../mongoose/models/user";

import { sendVerificationEmail } from "../../utils/helpers/auth/sendVerificationEmail";

// JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

//Sign in user payload
type SignInUserPayload = {
  email: string;
  password: string;
  pageRedirect?: string;
};

//Sign in user function
const signInUser = async (
  req: Request<{}, {}, SignInUserPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Destructure email and password from request body
    const { email, password, pageRedirect } = req.body;

    //Find user by email
    const user = await User.findOne({ email });

    //Throw error if user not found
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    //Check if user's email is verified
    //If not:: send new verification link
    if (!user.isVerified) {
      const newToken = jwt.sign({ userId: user._id }, jwtSecret, {
        expiresIn: "1d",
      });

      await sendVerificationEmail(req, user.email, newToken, pageRedirect);

      return res.status(401).json({
        message: "Unverified account. New verification email sent.",
      });
    }

    //Return error if Google sign in user
    if (user.isGoogle && !user.password)
      return res.status(404).json({
        message: "You signed up with Google. Please continue with Google.",
      });

    //Compare passwords
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    //Check if user's account is not disabled
    if (user.isDisabled) {
      return res
        .status(403)
        .json({ message: "Your account has been disabled." });
    }

    //Parse user's object as req for the next function
    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export default signInUser;
