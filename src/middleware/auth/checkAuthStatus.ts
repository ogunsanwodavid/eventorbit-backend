import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

import AuthRequest from "../../types/auth/AuthRequest";

import { User } from "../../mongoose/models/user";
import { SafeUser } from "../../types/auth/SafeUser";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

const checkAuthStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  //Get access token from cookies
  const token = req.cookies.accessToken;

  //Throw error if token not provided
  if (!token) {
    res
      .status(401)
      .json({ authenticated: false, message: "No token provided" });
    return;
  }

  //Decode token with jwt secret or throw error if token is invalid or has expired
  try {
    const decodedUser = jwt.verify(token, jwtSecret) as AuthRequest["user"];

    //Throw error if token not provided
    if (!decodedUser) {
      res.status(401).json({ authenticated: false, message: "Invalid token" });
      return;
    }

    //Find user by email
    const user = await User.findOne({ email: decodedUser.email });

    //Throw error if user not found
    if (!user) {
      res.status(401).json({ authenticated: false, message: "User not found" });
      return;
    }

    //Safe user , no password
    const { password, ...safeUser } = user;

    //Parse user's object as req for the next function
    (req as any).user = safeUser;

    next();
  } catch (error) {
    res.status(401).json({ authenticated: false, message: "Invalid token" });
  }
};

export default checkAuthStatus;
