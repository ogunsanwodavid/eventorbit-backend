import { NextFunction, Request, Response } from "express";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import { User } from "../../mongoose/models/user";

import { sendVerificationEmail } from "../../utils/helpers/sendVerificationEmail";

// JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

// Sign in user function
const signInUser = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Destructure email and password
    const { email, password } = req.body;

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

      await sendVerificationEmail(user.email, newToken);

      return res.status(401).json({
        message: "Unverified email. New verification email sent",
      });
    }

    //Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    //Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    //Parse user's object as req for the next function
    (req as any).user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export default signInUser;
