import { Request, Response, NextFunction } from "express";

const cleanUserFields = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userType } = req.body;

  if (userType === "organization") {
    req.body.firstName = undefined;
    req.body.lastName = undefined;
  } else if (userType === "individual") {
    req.body.organizationName = undefined;
  }

  next();
};

export default cleanUserFields;
