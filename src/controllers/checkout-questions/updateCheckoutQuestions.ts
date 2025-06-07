import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { CheckoutQuestionsModel } from "../../mongoose/models/checkoutQuestions";

import { UpdateCheckoutQuestionsInput } from "../../utils/schema-validations/checkout-questions/updateCheckoutQuestionsSchemaValidation";

import DEFAULT_CHECKOUT_QUESTIONS from "../../constants/checkout-questions/DEFAULT_CHECKOUT_QUESTIONS";

const updateCheckoutQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user object from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as UpdateCheckoutQuestionsInput["params"];

    //Get updated questions from request body
    const updatedQuestions = req.body as UpdateCheckoutQuestionsInput["body"];

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

    //Find current questions document using eventId
    const currentQuestions = await CheckoutQuestionsModel.findOne({ eventId });

    //If not found, create new document with default questions
    if (!currentQuestions) {
      await CheckoutQuestionsModel.create({
        eventId,
        questions: DEFAULT_CHECKOUT_QUESTIONS,
      });
    }

    //Apply updates with immutability protection
    const updatedQuestionsWithProtection = updatedQuestions.map(
      (current, index) => {
        const update = updatedQuestions[index];

        return current?.isImmutable
          ? { ...current, isVisible: update?.isVisible || true } // Only allow isVisible changes
          : { ...update, isImmutable: current?.isImmutable }; // Preserve original immutability
      }
    );

    //Atomic update
    await CheckoutQuestionsModel.findOneAndUpdate(
      { eventId },
      { $set: { questions: updatedQuestionsWithProtection } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Update checkout questions successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to update checkout questions",
    });
  }
};

export default updateCheckoutQuestions;
