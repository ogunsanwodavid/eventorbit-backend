import { NextFunction, Request, Response } from "express";

import axios from "axios";

import { IUser } from "../../mongoose/models/user";

interface LocationResponseAPI {
  address: {
    state: string;
    country: string;
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
  //::Fetch user location info from LocationIQ
  //and save to user object
  if (latitude && longitude) {
    try {
      const { data: locationRes } = await axios.get<LocationResponseAPI>(
        "https://us1.locationiq.com/v1/reverse",
        {
          params: {
            key: process.env.LOCATIONIQ_API_KEY!,
            lat: latitude,
            lon: longitude,
            format: "json",
          },
        }
      );

      const state = locationRes.address.state || "";
      const country = locationRes.address.country || "";

      user.location = [state, country].filter(Boolean).join(", ");

      await user.save();
    } catch (error: any) {
      console.error(
        "Error fetching location:",
        error.response?.data || error.message
      );
    }
  }

  next();
};

export default setUserLocation;
