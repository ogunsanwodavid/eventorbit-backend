import { Request, Response } from "express";

import { EventModel } from "../../mongoose/models/event";

import { GetRandomEventsInput } from "../../utils/schema-validations/events/getRandomEventsSchemaValidation";

const getRandomEvents = async (
  req: Request<{}, {}, {}, {}>,
  res: Response
): Promise<any> => {
  try {
    //Get number of events from request query
    const { amount } = (req as any).query as GetRandomEventsInput["query"];

    //Make the count an integer
    const count = parseInt(amount.toString()) || 5;

    //Validate count is positive
    if (count <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "Count must be a positive number",
      });
    }

    //Get total number of events in database
    const totalEvents = await EventModel.countDocuments();

    //If requested count exceeds total events, return all
    if (count >= totalEvents) {
      const allEvents = await EventModel.find().lean();
      return res.status(200).json({
        message: "All events retrieved",
        data: allEvents,
      });
    }

    // Get random sample of events
    const randomEvents = await EventModel.aggregate([
      { $sample: { size: count } },
    ]);

    res.status(200).json({
      message: `${count} random ${
        count > 1 ? "events" : "event"
      } fetched successfully`,
      data: randomEvents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch random events",
    });
  }
};

export default getRandomEvents;
