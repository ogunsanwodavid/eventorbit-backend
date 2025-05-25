import { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { IUser } from "../../mongoose/models/user";

interface LocationResponseAPI {
  data: {
    address: {
      state: String;
      country: String;
    };
  };
}

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
});

const setUserLocationFromGoogleState = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const state = req.query.state as string;

  console.log(req.query);

  //Get user from request
  const user = (req as any)["user"] as IUser;

  let latitude: number | undefined, longitude: number | undefined;

  if (state) {
    try {
      const decoded = JSON.parse(decodeURIComponent(state));
      const result = locationSchema.safeParse(decoded);
      if (result.success) {
        ({ latitude, longitude } = result.data);
      }
    } catch (error) {
      console.warn("Invalid state parameter:", error);
    }
  }

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

export default setUserLocationFromGoogleState;
