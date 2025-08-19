import { Response, Router } from "express";

import passport from "passport";

import registerUserHandler from "../controllers/auth/registerUser";
import verifyUserEmailHandler from "../controllers/auth/verifyUserEmail";
import signInUserHandler from "../controllers/auth/signInUser";
import forgotPasswordHandler from "../controllers/auth/forgotPassword";
import validateResetTokenHandler from "../controllers/auth/validateResetToken";
import resetPasswordHandler from "../controllers/auth/resetPassword";

import registerUserValidationSchema from "../utils/schema-validations/auth/registerUserSchemaValidation";
import verifyEmailValidationSchema from "../utils/schema-validations/auth/verifyEmailSchemaValidation";
import signInSchemaValidation from "../utils/schema-validations/auth/signInSchemaValidation";
import forgotPasswordSchemaValidation from "../utils/schema-validations/auth/forgotPasswordSchemaValidation";
import resetPasswordSchemaValidation from "../utils/schema-validations/auth/resetPasswordSchemaValidation";

import createSession from "../middleware/auth/createSession";
import checkAuthStatus from "../middleware/auth/checkAuthStatus";
import deleteSession from "../middleware/auth/deleteSession";
import setUserLocationHandler from "../middleware/auth/setUserLocation";
import parseGoogleSignInState from "../middleware/auth/parseGoogleSignInState";
import decodeGoogleSignInState from "../middleware/auth/decodeGoogleSignInState";
import cleanUserFields from "../middleware/auth/cleanUserFields";
import autoCreateUserProfile from "../middleware/auth/autoCreateUserProfile";
import autoCreateDefaultEmailPreferences from "../middleware/auth/autoCreateDefaultEmailPreferences";
import sendWelcomeEmail from "../middleware/auth/sendWelcomeEmail";
import googleSignInRedirect from "../middleware/auth/googleSignInRedirect";

//Define router
const router = Router();

//Register new user
//::Clean user object of unwanted values
//::Create user in database
//::Create a new user profile
//::Create the default email preferences settings for user
router.post(
  "/signup",
  registerUserValidationSchema,
  cleanUserFields,
  registerUserHandler,
  setUserLocationHandler,
  autoCreateUserProfile,
  autoCreateDefaultEmailPreferences,
  (_, res: Response) => {
    res.status(201).json({
      message: "Verification email sent",
    });
  }
);

//Verify new user's email
//::Send welcome email to user
router.get(
  "/verify-email",
  verifyEmailValidationSchema,
  verifyUserEmailHandler,
  sendWelcomeEmail,
  createSession(),
  (_, res: Response) => {
    res.status(200).json({ message: "Email verified successfully." });
  }
);

//User authentication status
router.get("/status", checkAuthStatus, (_, res: Response) => {
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
  (_, res: Response) => {
    res.status(200).json({
      message: "Sign in successful",
    });
  }
);

//User forgot password
//::Send password reset email
router.post(
  "/forgot-password",
  forgotPasswordSchemaValidation,
  forgotPasswordHandler
);

//Validate reset token from reset email
router.get("/validate-reset-token/:token", validateResetTokenHandler);

//Reset password
//::Reset token and user id in session is used to change password
router.post(
  "/reset-password",
  resetPasswordSchemaValidation,
  resetPasswordHandler
);

//Sign out user
router.get("/signout", deleteSession, (_, res: Response) => {
  res.status(200).json({ message: "Sign out successful" });
});

//Google OAUth sign in
//::Parse latitude, longitude and page redirect as queries for callback
router.get("/google", parseGoogleSignInState);

//Google sign in callback
//::Decode lat, long & page redirect from Google OAuth state params
//::Save location to user object
//::Auto create user profile with user info
//::Create the default email preferences for user
//::Send welcome email to user
//::Create new session
//::Redirect to provided redirect route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/sign-in",
    session: true,
  }),
  decodeGoogleSignInState,
  setUserLocationHandler,
  autoCreateUserProfile,
  autoCreateDefaultEmailPreferences,
  sendWelcomeEmail,
  createSession(),
  googleSignInRedirect
);

export default router;
