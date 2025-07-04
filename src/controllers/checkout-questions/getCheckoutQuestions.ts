import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { CheckoutQuestionsModel } from "../../mongoose/models/checkoutQuestions";

import { GetCheckoutQuestionsInput } from "../../utils/schema-validations/checkout-questions/getCheckoutQuestionsSchemaValidation";

const getCheckoutQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user object from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as GetCheckoutQuestionsInput["params"];

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

    //Find checkout questions document with same eventId
    const checkoutQuestions = await CheckoutQuestionsModel.findOne({
      eventId,
    });

    //Return error if checkout questions not found
    if (!checkoutQuestions) {
      res.status(404).json({ message: "Checkout questions not found" });
      return;
    }

    return res.status(200).json({
      message: "Checkout questions fetched successfully",
      checkoutQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch checkout questions",
    });
  }
};

export default getCheckoutQuestions;
