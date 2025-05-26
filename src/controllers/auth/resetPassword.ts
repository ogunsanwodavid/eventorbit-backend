import { Request, Response } from "express";

import bcrypt from "bcrypt";

import { User } from "../../mongoose/models/user";

type ResetPasswordPayload = {
  newPassword: string;
};

const resetPassword = async (
  req: Request<{}, {}, ResetPasswordPayload>,
  res: Response
): Promise<any> => {
  //Destructure new password from req body
  const { newPassword } = req.body;

  //Destructure reset token and user id from session
  const { resetToken, resetUserId } = req.session;

  //Return error if no token or user id in session
  if (!resetToken || !resetUserId) {
    return res.status(400).json({ message: "No valid reset session" });
  }

  try {
    //Find user with token and id
    //::Return only if token hasnt passed expiry time
    const user = await User.findOne({
      _id: resetUserId,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    //Return error if user not found
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    //Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    //Update password
    //::Set token and token expiry date to undefined
    //::Save to user object
    user.password = hashedNewPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    //Clear session
    delete req.session.resetToken;
    delete req.session.resetUserId;
    delete req.session.resetAttempts;

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

export default resetPassword;
