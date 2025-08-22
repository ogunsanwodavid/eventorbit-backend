import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

const getAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const user = (req as any)["user"] as IUser;

  //User account details
  const userAccount = {
    email: user.email,
    location: user.location,
    policies: user.policies,
  };

  return res.status(200).json({
    message: "User account fetched successfully",
    userAccount,
  });
};

export default getAccount;
