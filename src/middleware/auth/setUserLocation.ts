import { NextFunction, Request, Response } from "express";

import axios from "axios";

import { IUser } from "../../mongoose/models/user";

interface LocationResponseAPI {
  data: {
    address: {
      state: String;
      country: String;
    };
  };
}

const setUserLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Destructure latitude and longitude from req body
  const { latitude, longitude } = req.body;

  //Get user from request
  const user = (req as any)["user"] as IUser;

  //Dont set location if already updated by user manually
  if (user.hasLocationBeenManuallyUpdatedByUser) {
    return next();
  }

  //If lat and long
  //::Fetch user location info and save to user object
  if (latitude && longitude) {
    try {
      const locationRes: LocationResponseAPI = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
      );

      console.log(locationRes);

      const state = locationRes.data.address.state || "";
      const country = locationRes.data.address.country || "";

      user.location = `${state}${state && country && ","} ${country}`;

      await user.save();
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  }

  next();
};

export default setUserLocation;
