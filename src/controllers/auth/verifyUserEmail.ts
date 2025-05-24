import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { User } from "../../mongoose/models/user";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

const verifyUserEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Verification token
  const { token } = req.query as { token: string };

  try {
    //Verify jwt token
    const payload = jwt.verify(token, jwtSecret) as { userId: string };

    //Find user from database and return error if not found
    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    //Return error if user's email already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    //Update user's email verification status
    user.isVerified = true;
    await user.save();

    //Parse user's object as req for the next function
    (req as any).user = user;

    next();
  } catch (err) {
    return res.status(400).json({ message: "Verification failed" });
  }
};

export default verifyUserEmail;
