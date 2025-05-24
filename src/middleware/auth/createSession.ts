import { Response, Request, NextFunction } from "express";

import jwt from "jsonwebtoken";

import { IUser } from "../../mongoose/models/user";

//Userpayload interface
interface UserPayload {
  userId: string;
  email: string;
}

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

const createSession = (userKey: "user" | "payload" = "user") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    //Get user from request
    // const user = (req as any)[userKey] as UserPayload;
    const user = (req as any)[userKey] as IUser;

    //Check for user credentials
    if (!user || !user.id || !user.email) {
      res
        .status(400)
        .json({ message: "Cannot create session. Missing user data." });
      return;
    }

    //Create new session token and sign with user's id and email
    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    //Parse user's object as req for the next function
    //(req as any).user = { userId: user.id, email: user.email };
    (req as any).user = user;

    next();
  };
};

export default createSession;
