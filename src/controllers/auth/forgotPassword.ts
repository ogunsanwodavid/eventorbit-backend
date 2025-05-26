import { Request, Response } from "express";

import jwt from "jsonwebtoken";

import { User } from "../../mongoose/models/user";

import sendPasswordResetEmail from "../../utils/helpers/auth/sendPasswordResetEmail";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

//Forgot password payload
type ForgotPasswordPayload = {
  email: string;
};

//Register user function
const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordPayload>,
  res: Response
): Promise<any> => {
  try {
    //Destructure the email from the request body
    const { email } = req.body;

    //Rate-limit attempts using session to 5
    req.session.resetAttempts = (req.session.resetAttempts || 0) + 1;
    if (req.session.resetAttempts > 5) {
      return res
        .status(429)
        .json({ message: "Too many attempts, try again later" });
    }

    //Check for user
    const user = await User.findOne({ email });

    //Return error if user not found
    if (!user) return res.status(400).json({ message: "User not found." });

    //Prevent Google accounts from manually resetting password
    if (user.isGoogle)
      return res.status(403).json({
        message: "You signed up with a Google account.",
      });

    //Generate verification token
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1d",
    });

    //Save reset password token and expiry time to user object
    //::Token expires in 24 hours
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600 * 1000 * 24);
    await user.save();

    //Send password reset email
    await sendPasswordResetEmail(email, token);

    res.status(201).json({
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send reset email." });
  }
};

export default forgotPassword;
