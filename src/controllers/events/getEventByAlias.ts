import { Request, Response } from "express";

import { EventModel } from "../../mongoose/models/event";

const getEventByAlias = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get alias from request params
    const { alias } = req.params;

    //Find event by alias
    const event = await EventModel.findOne({ alias }).lean();

    //Return error if not found
    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    res.status(200).json({
      message: "Event fetched successfully.",
      event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch event",
    });
  }
};

export default getEventByAlias;
