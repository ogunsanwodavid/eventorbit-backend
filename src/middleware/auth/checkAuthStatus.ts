import { Request, Response, NextFunction } from "express";

const checkAuthStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Check if user is already stored in session
  if (!req.session.user) {
    return res.status(401).json({ message: "Not unauthorized" });
  }

  next();
};

export default checkAuthStatus;
