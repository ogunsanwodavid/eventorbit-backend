import { Request, Response } from "express";

import { User } from "../../mongoose/models/user";

const validateResetToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  //Destructure token from req params
  const { token } = req.params as { token: string };

  try {
    //Find user with reset token
    //::Return only if token isnt passed expiry time
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    //Return error if user isnt found
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Store token and user ID in session
    req.session.resetToken = token;
    req.session.resetUserId = user.id;

    res.status(200).json({ message: "Reset token valid" });
  } catch (error) {
    console.error("Reset token validation error:", error);
    res.status(500).json({ message: "Failed to validate reset token" });
  }
};

export default validateResetToken;
