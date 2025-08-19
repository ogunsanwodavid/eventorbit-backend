import { NextFunction, Request, Response } from "express";

//Decode the latitude, longitude and pageRedirect from the state params in the Google OAuth Callback
//Then set as request body for the next middleware
const decodeGoogleSignInState = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const state = req.query.state as string;
  const { latitude, longitude, pageRedirect } = JSON.parse(
    Buffer.from(state, "base64").toString()
  );

  req.body ??= {};

  req.body.latitude = Number(latitude);
  req.body.longitude = Number(longitude);
  req.body.pageRedirect = String(pageRedirect);

  next();
};

export default decodeGoogleSignInState;
