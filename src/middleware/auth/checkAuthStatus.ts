import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

const checkAuthStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  //Get access token from cookies
  const token = req.cookies.accessToken;

  //Thrpw error if token not provided
  if (!token) {
    res
      .status(401)
      .json({ authenticated: false, message: "No token provided" });
    return;
  }

  //Decode token with jwt secret or throw error if token is invalid or has expired
  try {
    const decoded = jwt.verify(token, jwtSecret);
    (req as any).user = decoded; // attach user payload
    next();
  } catch (error) {
    res.status(401).json({ authenticated: false, message: "Invalid token" });
  }
};

export default checkAuthStatus;
