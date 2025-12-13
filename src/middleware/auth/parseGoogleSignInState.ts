import { NextFunction, Request, Response } from "express";

import passport from "passport";

//Parse latitude and longitude from the request query as a state params in the Google OAuth route
const parseGoogleSignInState = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Client URL
  const clientUrl = req.headers.origin || req.headers.referer;

  //Request query params
  const { latitude, longitude, pageRedirect } = req.query;

  const state = Buffer.from(
    JSON.stringify({
      clientUrl,
      latitude,
      longitude,
      pageRedirect,
    })
  ).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
};

export default parseGoogleSignInState;
