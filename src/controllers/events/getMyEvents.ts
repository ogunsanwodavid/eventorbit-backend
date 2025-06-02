import { Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

const getMyEvents = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //User id
    const userId = user._id as String;

    //Get req query parameters
    //::Pagination info
    const { page, limit, status } = req.query as any;

    //Base query
    const query = { hostId: userId } as any;
    if (status) query.status = status;

    const [events] = await Promise.all([
      //Get paginated events with population
      EventModel.find(query)
        .select("-__v -updatedAt") //Exclude unnecessary fields
        .sort({ createdAt: -1 }) //Newest first
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.status(200).json({
      message: "Your events fetched successfully",
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch your events",
    });
  }
};

export default getMyEvents;
