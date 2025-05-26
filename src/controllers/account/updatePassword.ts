import { NextFunction, Request, RequestHandler, Response } from "express";

import bcrypt from "bcrypt";

import { IUser, User } from "../../mongoose/models/user";

type UpdatePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Get user object from request
  const { _id: userId } = (req as any)["user"] as IUser;

  //Destructure user's new eamil from body
  const { oldPassword, newPassword } = req.body;

  try {
    //Find user by the id
    const user = await User.findById(userId);

    //Return error if user not found
    if (!user) return res.status(404).json({ message: "User not found" });

    //Prevent Google accounts from updating passwords manually
    if (user.isGoogle)
      return res.status(403).json({
        message:
          "You signed up with Google. Password cannot be updated manually.",
      });

    //Check if new password isnt same as before
    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password is the same as current password" });
    }

    //Return error if password not found in user object
    if (!user.password)
      return res.status(404).json({ message: "Password is required" });

    //Compare old passwords
    //Return error if invalid
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    //Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    //Update user's password with new hashed one
    user.password = hashedNewPassword;

    await user.save();

    //Parse user's object as req for the next function
    (req as any).user = user;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update password" });
  }
};

export default updatePassword;
