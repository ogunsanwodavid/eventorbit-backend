import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { DiscountCodesModel } from "../../mongoose/models/discountCodes";

import { GetDiscountCodesInput } from "../../utils/schema-validations/discount-codes/getDiscountCodesSchemaValidation";

const getDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user object from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as GetDiscountCodesInput["params"];

    //Validate event ID format
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid event ID format",
      });
    }

    //Find event and verify ownership using hostId
    const event = await EventModel.findOne({
      _id: eventId,
      hostId: user._id,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have permission",
      });
    }

    //Find discount codes document with same eventId
    const discountCodes = await DiscountCodesModel.findOne({
      eventId,
    });

    //Return error if discount codes not found
    if (!discountCodes) {
      res.status(404).json({ message: "Discount codes not found" });
      return;
    }

    return res.status(200).json({
      message: "Discount codes fetched successfully",
      discountCodes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch discount codes",
    });
  }
};

export default getDiscountCodes;
