import { Request, Response, Router } from "express";

import registerUserHandler from "../controllers/auth/registerUser";
import verifyEmailHandler from "../controllers/auth/verifyEmail";

import { registerUserValidationSchema } from "../utils/schema-validations/registerUserSchemaValidation";
import { verifyEmailValidationSchema } from "../utils/schema-validations/verifyEmailSchemaValidation";

import createSession from "../middleware/auth/createSession";
import checkAuthStatusHandler from "../middleware/auth/checkAuthStatus";

const router = Router();

//Register new user
router.post("/signup", registerUserValidationSchema, registerUserHandler);

//Verify new user's email
router.get(
  "/verify-email",
  verifyEmailValidationSchema,
  verifyEmailHandler,
  createSession(),
  (req: Request, res: Response) => {
    res.status(200).json({ message: "Email verified successfully." });
  }
);

//User authentication status
router.get("/status", checkAuthStatusHandler, (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  res.status(200).json({ authenticated: true, user });
});

export default router;
