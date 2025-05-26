import { NextFunction, Request, Response } from "express";

//Decode the latitude and longitude from the state params in the Google OAuth Callback
//Then set as request body for the next middleware
const decodeLocationGoogleState = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const state = req.query.state as string;
  const { latitude, longitude } = JSON.parse(
    Buffer.from(state, "base64").toString()
  );

  req.body ??= {};

  req.body.latitude = Number(latitude);
  req.body.longitude = Number(longitude);

  next();
};

export default decodeLocationGoogleState;
