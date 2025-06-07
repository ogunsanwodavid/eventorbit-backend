import { NextFunction, Request, Response } from "express";

import { isValidObjectId, Types } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import {
  CheckoutQuestionsModel,
  ICheckoutQuestions,
} from "../../mongoose/models/checkoutQuestions";

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

    //Instantiate current checkout questions
    let currentQuestions: ICheckoutQuestions | null;

    //Find current questions document using eventId
    currentQuestions = await CheckoutQuestionsModel.findOne({ eventId });

    //If not found, create new document with default questions
    if (!currentQuestions) {
      //Add _id to default questions if creating new
      const questionsWithIds = DEFAULT_CHECKOUT_QUESTIONS.map((q) => ({
        ...q,
        _id: new Types.ObjectId(),
      }));

      currentQuestions = await CheckoutQuestionsModel.create({
        eventId,
        questions: questionsWithIds,
      });
    }

    //Extract IDs of questions to keep
    const questionIdsToKeep = updatedQuestions
      .filter((q) => q._id && isValidObjectId(q._id))
      .map((q) => new Types.ObjectId(q._id));

    //IDs of all immutable questions
    const immutableQuestionIds = currentQuestions.questions
      .filter((q) => q.isImmutable)
      .map((q) => q._id);

    //Prepare bulk operations
    const bulkOps = [
      //Remove questions not in the update list
      {
        updateOne: {
          filter: { eventId },
          update: {
            $pull: {
              questions: {
                _id: {
                  $nin: [
                    ...questionIdsToKeep,
                    ...immutableQuestionIds, // Always keep immutables
                  ],
                },
              },
            },
          },
        },
      },
      //Update or add questions
      ...updatedQuestions.map((question) => {
        //New question (no ID or invalid ID)
        if (!question._id || !isValidObjectId(question._id)) {
          return {
            updateOne: {
              filter: { eventId },
              update: {
                $push: {
                  questions: {
                    ...question,
                    _id: new Types.ObjectId(),
                    isImmutable: false, //New questions are mutable
                  },
                },
              },
            },
          };
        }

        //Existing question
        const questionId = new Types.ObjectId(question._id);
        const existingQuestion = currentQuestions.questions.find((q) =>
          q._id.equals(questionId)
        );

        //Immutable question - only allow isVisible changes
        if (existingQuestion?.isImmutable) {
          return {
            updateOne: {
              filter: { eventId, "questions._id": questionId },
              update: {
                $set: {
                  "questions.$.isVisible":
                    question.isVisible ?? existingQuestion.isVisible,
                },
              },
            },
          };
        }

        //Mutable question - full update
        return {
          updateOne: {
            filter: { eventId, "questions._id": questionId },
            update: {
              $set: {
                "questions.$": {
                  ...question,
                  _id: questionId, //Preserve original ID
                  isImmutable: existingQuestion?.isImmutable || false,
                },
              },
            },
          },
        };
      }),
    ];

    //Execute all operations
    await CheckoutQuestionsModel.bulkWrite(bulkOps);

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
