import { Request, Response, NextFunction } from "express";

import { IEvent } from "../../mongoose/models/event";

import { CheckoutQuestionsModel } from "../../mongoose/models/checkoutQuestions";

import DEFAULT_CHECKOUT_QUESTIONS from "../../constants/checkout-questions/DEFAULT_CHECKOUT_QUESTIONS";

const autoCreateDefaultCheckoutQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Get event object from request
    const { _id: eventId } = (req as any)["event"] as IEvent;

    //Create with default questions
    await CheckoutQuestionsModel.create({
      eventId,
      questions: DEFAULT_CHECKOUT_QUESTIONS,
    });

    next();
  } catch (error) {
    console.error(error);
    next(new Error("Failed to auto create default checkout questions"));
  }
};

export default autoCreateDefaultCheckoutQuestions;
