import { Request, Response } from "express";

import { EventModel } from "../../mongoose/models/event";

const searchEvents = async (req: Request, res: Response) => {
  try {
    //Get pagination params from request query
    const { page = 1, limit = 20 } = req.query;

    //Events to skip
    const skip = (Number(page) - 1) * Number(limit);

    //Query database with search filters
    //Return only live and public events
    const query = {
      ...req.searchFilters,
      status: "live",
      "basics.visibility": "public",
    };

    //Return events search objects and total events got
    const [events, total] = await Promise.all([
      EventModel.find(query)
        .skip(skip)
        .limit(Number(limit))
        /* .populate({
          path: "hostId",
          select: "profile",
          populate: {
            path: "profile",
            select: "info.firstName info.lastName info.organizationName",
          },
        }) */
        .lean(),
      EventModel.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to search events",
    });
  }
};

export default searchEvents;
