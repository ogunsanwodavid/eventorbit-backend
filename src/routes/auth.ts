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
import setUserLocationHandler from "../middleware/auth/setUserLocation";
import setUserLocationFromGoogleStateHandler from "../middleware/auth/setUserLocationFromGoogleState";

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

//Route to start OAuth with Google
router.get(
  "/google",
  /*   passport.authenticate("google", { scope: ["profile", "email"] }) */
  (req, res, next) => {
    const { latitude, longitude } = req.query;
    if (latitude && longitude) {
      const state = encodeURIComponent(JSON.stringify({ latitude, longitude }));
      return passport.authenticate("google", {
        scope: ["profile", "email"],
        state,
      })(req, res, next);
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  }
);

//Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // Redirect here if auth fails
    successRedirect: "/", // Redirect here after successful login
  }),
  setUserLocationFromGoogleStateHandler,
  createSession(),
  (req: Request, res: Response) => {
    // Redirect to home
    res.redirect("/");
  }
);

export default router;
