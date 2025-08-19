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
  //::Fetch user location info and save to user object
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

      console.log(locationRes);

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

/* 
http://localhost:3000/api/auth/google?latitude=6.5077248&longitude=3.391488&pageRedirect=/create
try {
      const locationRes: LocationResponseAPI = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: {
            "User-Agent": "EventOrbit/1.0 (ogunsanwodavid123@gmail.com)",
            "Accept-Language": "en",
          },
        }
      );

      const state = locationRes.data.address.state || "";
      const country = locationRes.data.address.country || "";

      user.location = `${state}${state && country && ","} ${country}`;

      await user.save();
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } */
