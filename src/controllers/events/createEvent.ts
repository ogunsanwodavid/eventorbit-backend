import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { uploadBase64 } from "../../config/cloudinary";

import { CreateEventInput } from "../../utils/schema-validations/events/createEventSchemaValidation";

import { generateEventAlias } from "../../utils/helpers/events/generateEventAlias";

const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Event data from request body
    const eventData = req.body as CreateEventInput["body"];

    //Generate event alias
    const eventAlias = generateEventAlias(eventData.basics.name);

    //Phase 1: Create event with empty image fields
    const newEvent = await EventModel.create({
      hostId: user._id,
      ...eventData,
      alias: eventAlias,
      additionalDetails: {
        ...eventData.additionalDetails,
        socialMediaPhoto: "",
        eventCoverPhoto: "",
        additionalPhotos: [],
      },
    });

    const { _id: eventId, hostId } = newEvent;

    //Phase 2: Upload additionalDetails with exact naming convention
    const uploadTasks = [];

    if (eventData.additionalDetails.socialMediaPhoto) {
      uploadTasks.push(
        uploadBase64(
          eventData.additionalDetails.socialMediaPhoto,
          "events/social",
          {
            public_id: `${hostId}-${eventId}-social`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }
        ).then((url) => {
          newEvent.additionalDetails.socialMediaPhoto = url;
        })
      );
    }

    if (eventData.additionalDetails.eventCoverPhoto) {
      uploadTasks.push(
        uploadBase64(
          eventData.additionalDetails.eventCoverPhoto,
          "events/covers",
          {
            public_id: `${hostId}-${eventId}-social`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }
        ).then((url) => {
          newEvent.additionalDetails.eventCoverPhoto = url;
        })
      );
    }

    if (
      eventData.additionalDetails.additionalPhotos &&
      eventData.additionalDetails.additionalPhotos.length > 0
    ) {
      eventData.additionalDetails.additionalPhotos.forEach((base64, index) => {
        uploadTasks.push(
          uploadBase64(base64, "events/additionals", {
            public_id: `${hostId}-${eventId}-additional-${index}`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }).then((url) => {
            newEvent.additionalDetails.additionalPhotos?.push(url);
          })
        );
      });
    }

    //Wait for all uploads then save
    await Promise.all(uploadTasks);
    await newEvent.save();

    next();
  } catch (error) {
    console.error("Event creation failed:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create event with photos",
    });
  }
};

export default createEvent;
