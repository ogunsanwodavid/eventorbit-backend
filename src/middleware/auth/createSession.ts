import { Response, Request, NextFunction } from "express";

import { IUser } from "../../mongoose/models/user";

const createSession = (userKey: "user" | "payload" = "user") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    //Get user from request
    const user = (req as any)[userKey] as IUser;

    //Check for user credentials
    if (!user || !user.id || !user.email) {
      res
        .status(400)
        .json({ message: "Cannot create session. Missing user data." });
      return;
    }

    //Create express session
    req.session.user = user;

    next();
  };
};

export default createSession;
