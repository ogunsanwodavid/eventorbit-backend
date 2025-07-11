import { NextFunction, Request, Response } from "express";

import { IUser, User } from "../../mongoose/models/user";

type UpdatePoliciesPayload = {
  termsAndConditions: string;
  privacyPolicy: string;
};

const updatePolicies = async (
  req: Request<{}, {}, UpdatePoliciesPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  //Destructure user's events terms & conditions and privacy policy from body
  const { termsAndConditions, privacyPolicy } = req.body;

  try {
    //Find user by the id
    const user = await User.findById(userId);

    //Return error if user not found
    if (!user) return res.status(404).json({ message: "User not found" });

    //Update user's privacy policy with new values
    user.policies = { termsAndConditions, privacyPolicy };

    await user.save();

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update policies" });
  }
};

export default updatePolicies;
