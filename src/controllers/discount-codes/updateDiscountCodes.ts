import { NextFunction, Request, Response } from "express";

import { isValidObjectId, Types } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { DiscountCodesModel } from "../../mongoose/models/discountCodes";

import { UpdateDiscountCodesInput } from "../../utils/schema-validations/discount-codes/updateDiscountCodesSchemaValidation";

const updateDiscountCodes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user object from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as UpdateDiscountCodesInput["params"];

    //Get updated codes from request body
    const updatedCodes = req.body as UpdateDiscountCodesInput["body"];

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

    //Find current codes document using eventId
    const currentCodes = await DiscountCodesModel.findOne({ eventId });

    //If not found, create a new document
    if (!currentCodes) {
      //Create new document with unique codes
      const newCodes = updatedCodes.map((code) => ({
        ...code,
        _id: new Types.ObjectId(),
        uses: {
          maxUse: code.uses?.maxUse || 0,
          totalUse: 0, //Initialize new codes with 0 uses
        },
      }));

      //Check for duplicate codes
      const codeValues = newCodes.map((c) => c.code);
      if (new Set(codeValues).size !== codeValues.length) {
        return res.status(400).json({
          status: "fail",
          message: "Duplicate discount codes are not allowed",
        });
      }

      await DiscountCodesModel.create({
        eventId,
        codes: newCodes,
      });

      return res.status(200).json({
        message: "Created new discount codes successfully",
      });
    }

    //Extract and validate all code IDs from the updatedCodes
    const codeIdsToKeep = updatedCodes
      .filter((code) => code._id && isValidObjectId(code._id))
      .map((code) => new Types.ObjectId(code._id));

    //Prepare bulk operations
    const bulkOps = [
      //Remove codes not in the updated list
      {
        updateOne: {
          filter: { eventId },
          update: {
            $pull: {
              codes: {
                _id: { $nin: codeIdsToKeep },
              },
            },
          },
        },
      },
      //Handle updates and additions
      ...updatedCodes.map((codeUpdate) => {
        //For new codes (no _id or invalid _id)
        if (!codeUpdate._id || !isValidObjectId(codeUpdate._id)) {
          return {
            updateOne: {
              filter: { eventId },
              update: {
                $push: {
                  codes: {
                    ...codeUpdate,
                    _id: new Types.ObjectId(),
                    uses: {
                      maxUse: codeUpdate.uses?.maxUse || 0,
                      totalUse: 0, //Initialize new codes with 0 uses
                    },
                  },
                },
              },
            },
          };
        }

        //For existing codes
        const codeId = new Types.ObjectId(codeUpdate._id);
        return {
          updateOne: {
            filter: { eventId, "codes._id": codeId },
            update: {
              $set: {
                ...(codeUpdate.isActive !== undefined && {
                  "codes.$.isActive": codeUpdate.isActive,
                }),
                ...(codeUpdate.code !== undefined && {
                  "codes.$.code": codeUpdate.code,
                }),
                ...(codeUpdate.amount !== undefined && {
                  "codes.$.amount": codeUpdate.amount,
                }),
                ...(codeUpdate.uses?.maxUse !== undefined && {
                  "codes.$.uses.maxUse": codeUpdate.uses.maxUse,
                }),
              },
            },
          },
        };
      }),
    ];

    //Execute atomic updates
    await DiscountCodesModel.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Updated discount codes successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to update discount codes",
    });
  }
};

export default updateDiscountCodes;
