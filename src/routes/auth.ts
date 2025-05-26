import { Request, Response, Router } from "express";

import passport from "passport";

import registerUserHandler from "../controllers/auth/registerUser";
import verifyUserEmailHandler from "../controllers/auth/verifyUserEmail";
import signInUserHandler from "../controllers/auth/signInUser";

import registerUserValidationSchema from "../utils/schema-validations/auth/registerUserSchemaValidation";
import verifyEmailValidationSchema from "../utils/schema-validations/auth/verifyEmailSchemaValidation";
import signInSchemaValidation from "../utils/schema-validations/auth/signInSchemaValidation";

import createSession from "../middleware/auth/createSession";
import checkAuthStatusHandler from "../middleware/auth/checkAuthStatus";
import deleteSession from "../middleware/auth/deleteSession";
import setUserLocationHandler from "../middleware/auth/setUserLocation";
import parseLocationGoogleStateHandler from "../middleware/auth/parseLocationGoogleState";
import decodeLocationGoogleStateHandler from "../middleware/auth/decodeLocationGoogleState";

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
//::Set user's location to current location
router.post(
  "/signin",
  signInSchemaValidation,
  signInUserHandler,
  setUserLocationHandler,
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

//Google OAUth sign in
//::Parse latitude and longitude as queries for callback
router.get("/google", parseLocationGoogleStateHandler);

//Google sign in callback
//::Decode lat and long from Google OAuth state params
//::Save location to user object
//::Create new session
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  decodeLocationGoogleStateHandler,
  setUserLocationHandler,
  createSession(),
  (req: Request, res: Response) => {
    // Redirect to home
    res.redirect("/");
  }
);

export default router;
