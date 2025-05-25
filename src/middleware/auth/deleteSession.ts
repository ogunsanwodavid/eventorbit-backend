import { Request, Response, NextFunction } from "express";

const deleteSession = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove user from session
  if (req.session.user) {
    delete req.session.user;
  }

  // Destroy entire session
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      return res.status(500).json({ message: "Failed to end session" });
    }

    // Clear cookie
    res.clearCookie("connect.sid", {
      path: "/",
    });

    next();
  });
};

export default deleteSession;
