import { NextFunction, Request, Response } from "express";

import { User } from "../../mongoose/models/user";

type UpdateLocationParams = {
  id: string;
};

type UpdateLocationPayload = {
  location: string;
};

const updateLocation = async (
  req: Request<UpdateLocationParams, any, UpdateLocationPayload>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Destructure user's id from the query
  const { id: userId } = req.params;

  //Destructure user's new location from body
  const { location: newLocation } = req.body;

  try {
    //Find user by the id
    const user = await User.findById(userId);

    //Return error if user not found
    if (!user) return res.status(404).json({ message: "User not found" });

    //Update user's location with new one
    //::INDICATE USER HAS UPDATED LOCATION MANUALLY
    //::HENCE PREVENT AUTO LOCATION REGENERATION ON SIGN IN
    user.location = newLocation;
    user.hasLocationBeenManuallyUpdatedByUser = true;

    await user.save();

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update location" });
  }
};

export default updateLocation;
