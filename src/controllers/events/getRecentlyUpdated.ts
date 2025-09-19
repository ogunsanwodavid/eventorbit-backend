import { Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { GetRecentlyUpdatedInput } from "../../utils/schema-validations/events/getRecentlyUpdatedSchemaValidation";

const getRecentlyUpdated = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //User id
    const userId = user._id as String;

    //Get req query parameters
    const queryParams = (req as any).query as GetRecentlyUpdatedInput["query"];

    //Number of events to fetch
    //3 as default
    const number = queryParams.number || 3;

    //Base query:: only events from this user
    const query = { hostId: userId } as any;

    //Find recently updated events
    const events = await EventModel.find(query)
      .populate({
        path: "hostId",
        select: "name avatar",
      })
      .populate({
        path: "tickets.types",
        select: "type name price",
      })
      .select("-__v")
      .sort({ updatedAt: -1 })
      .limit(number)
      .lean();

    res.status(200).json({
      message: "Recently updated events fetched successfully",
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch recently updated events",
    });
  }
};

export default getRecentlyUpdated;
