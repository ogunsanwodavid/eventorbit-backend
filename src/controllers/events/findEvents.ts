import { Request, Response } from "express";

import { EventModel } from "../../mongoose/models/event";

import { FindEventsInput } from "../../utils/schema-validations/events/findEventsSchemaValidation";

const findEvents = async (req: Request, res: Response) => {
  try {
    //Get query parameters
    const queryParams = (req as any).query as FindEventsInput["query"];

    //Get pagination params from request query
    const page = queryParams?.page || 1;
    const limit = queryParams?.limit || 20;

    //Events to skip
    const skip = (page - 1) * limit;

    //Query database with search filters
    //Return only live and public events
    const query = {
      ...req.searchFilters,
      status: "live",
      "basics.visibility": "public",
    };

    //Return events search objects and total events got
    const [events, total] = await Promise.all([
      EventModel.find(query).skip(skip).limit(limit).lean(),
      EventModel.countDocuments(query),
    ]);

    res.status(200).json({
      message: "Events fetched sucessfully",
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to find events",
    });
  }
};

export default findEvents;
