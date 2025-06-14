import { Request, Response, NextFunction } from "express";

import { User } from "../../mongoose/models/user";

const checkAuthStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Check if user is already stored in session
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  //Check if user's account exists and is not disabled
  //::If disabled, delete current session
  const user = await User.findById(req.session.user?._id);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  if (user.isDisabled) {
    delete req.session.user;
    return res.status(403).json({ message: "Your account has been disabled" });
  }

  //Parse user's object as req for the next function
  (req as any).user = user;

  next();
};

export default checkAuthStatus;
