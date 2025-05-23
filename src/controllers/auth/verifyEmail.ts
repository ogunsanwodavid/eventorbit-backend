import { NextFunction, Request, RequestHandler, Response } from "express";

import jwt from "jsonwebtoken";

import { User } from "../../mongoose/models/user";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

//Verify email payload
interface VerifyEmailPayload {
  token: string;
}

const verifyEmail = async (
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

    //Parse user's id and email as req for the next function
    (req as any).user = { userId: user.id, email: user.email };
    next();
  } catch (err) {
    //next(err);
    return res.status(400).json({ message: "Verification failed" });
  }
};

export default verifyEmail;
