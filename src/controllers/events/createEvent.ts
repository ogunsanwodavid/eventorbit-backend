import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EventModel, IEvent } from "../../mongoose/models/event";

const createEvent = async (
  req: Request<{}, {}, Omit<IEvent, "hostId">>,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Set hostId tp user's id
    const hostId = user._id;

    // Get request body
    const eventData = req.body;

    // Create new event with hostId
    const newEvent = new EventModel({
      ...eventData,
      hostId,
    });

    //Validate the event (triggers Mongoose validation)
    await newEvent.validate();

    // Save to database
    await newEvent.save();

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export default createEvent;
