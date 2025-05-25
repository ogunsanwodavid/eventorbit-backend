import { Request, Response, Router } from "express";

import passport from "passport";

import { IUser } from "../mongoose/models/user";

import registerUserHandler from "../controllers/auth/registerUser";
import verifyUserEmailHandler from "../controllers/auth/verifyUserEmail";
import signInUserHandler from "../controllers/auth/signInUser";

import registerUserValidationSchema from "../utils/schema-validations/auth/registerUserSchemaValidation";
import verifyEmailValidationSchema from "../utils/schema-validations/auth/verifyEmailSchemaValidation";
import signInSchemaValidation from "../utils/schema-validations/auth/signInSchemaValidation";

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
router.get("/signout", deleteSession, (req: Request, res: Response) => {
  res.status(200).json({ message: "Sign out successful" });
});

//Route to start OAuth with Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // Redirect here if auth fails
    successRedirect: "/", // Redirect here after successful login
  }),
  (req: Request, res: Response) => {
    // Google user profile is attached to req.user by Passport
    // Save to session
    req.session.user = req.user as IUser;

    // Redirect to dashboard or home
    res.redirect("/");
  }
);

export default router;
