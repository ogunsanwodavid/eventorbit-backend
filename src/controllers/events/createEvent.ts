import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { uploadBase64 } from "../../config/cloudinary";

import { CreateEventInput } from "../../utils/schema-validations/events/createEventSchemaValidation";

import { generateEventAlias } from "../../utils/helpers/events/generateEventAlias";

import DEFAULT_EVENT_PHOTOS, {
  EventCategory,
} from "../../constants/events/DEFAULT_EVENT_PHOTOS";

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
        additionalPhotos:
          eventData.additionalDetails.additionalPhotos &&
          eventData.additionalDetails.additionalPhotos.length > 0
            ? []
            : undefined,
      },
    });

    const { _id: eventId, hostId, basics } = newEvent;
    const category = basics.category.toLowerCase() as EventCategory;

    //Phase 2: Upload additionalDetails with standard naming convention
    //::Upload images from the base64 string if they exist
    //::OR default stock photos for social media and cover
    const uploadTasks = [];

    if (eventData.additionalDetails?.socialMediaPhoto) {
      uploadTasks.push(
        uploadBase64(
          eventData.additionalDetails.socialMediaPhoto,
          "eventorbit/events/social",
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
    } else {
      //Use "others" if category doesnt exist
      newEvent.additionalDetails.socialMediaPhoto =
        DEFAULT_EVENT_PHOTOS[category]?.social ||
        DEFAULT_EVENT_PHOTOS["others"]?.social;
    }

    if (eventData.additionalDetails?.eventCoverPhoto) {
      uploadTasks.push(
        uploadBase64(
          eventData.additionalDetails.eventCoverPhoto,
          "eventorbit/events/covers",
          {
            public_id: `${hostId}-${eventId}-cover`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }
        ).then((url) => {
          newEvent.additionalDetails.eventCoverPhoto = url;
        })
      );
    } else {
      //Use "others" if category doesnt exist
      newEvent.additionalDetails.eventCoverPhoto =
        DEFAULT_EVENT_PHOTOS[category]?.cover ||
        DEFAULT_EVENT_PHOTOS["others"]?.cover;
    }

    if (
      eventData.additionalDetails?.additionalPhotos &&
      eventData.additionalDetails.additionalPhotos.length > 0
    ) {
      eventData.additionalDetails.additionalPhotos.forEach((base64, index) => {
        uploadTasks.push(
          uploadBase64(base64, "eventorbit/events/additionals", {
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

    //Parse event's object as req for the next function
    (req as any).event = newEvent;

    next();
  } catch (error) {
    console.error("Event creation failed:", error);
    res.status(500).json({
      message: "Failed to create event",
    });
  }
};

export default createEvent;
