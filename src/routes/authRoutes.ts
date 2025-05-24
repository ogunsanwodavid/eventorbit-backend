import { Request, Response, Router } from "express";

import registerUserHandler from "../controllers/auth/registerUser";
import verifyUserEmailHandler from "../controllers/auth/verifyUserEmail";
import signInUserHandler from "../controllers/auth/signInUser";

import registerUserValidationSchema from "../utils/schema-validations/registerUserSchemaValidation";
import verifyEmailValidationSchema from "../utils/schema-validations/verifyEmailSchemaValidation";
import signInSchemaValidation from "../utils/schema-validations/signInSchemaValidation";

import createSession from "../middleware/auth/createSession";
import checkAuthStatusHandler from "../middleware/auth/checkAuthStatus";
import deleteSession from "../middleware/auth/deleteSession";

//Define router
const router = Router();

//Register new user
router.post("/signup", registerUserValidationSchema, registerUserHandler);

//Verify new user's email
router.get(
  "/verify-email",
  verifyEmailValidationSchema,
  verifyUserEmailHandler,
  createSession(),
  (req: Request, res: Response) => {
    res.status(200).json({ message: "Email verified successfully." });
  }
);

//User authentication status
router.get("/status", checkAuthStatusHandler, (req: Request, res: Response) => {
  res.status(200).json({ authenticated: true });
});

//Sign user in with their email and password
router.post(
  "/signin",
  signInSchemaValidation,
  signInUserHandler,
  createSession(),
  (req: Request, res: Response) => {
    res.status(200).json({
      message: "Sign in successful",
    });
  }
);

//Sign out user
router.get("/signout", deleteSession);

export default router;
