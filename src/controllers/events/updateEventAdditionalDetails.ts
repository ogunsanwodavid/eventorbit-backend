import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { UpdateEventAdditionalDetailsInput } from "../../utils/schema-validations/events/updateEventAdditionalDetailsSchemaValidation";

import { uploadBase64 } from "../../config/cloudinary";

import DEFAULT_EVENT_PHOTOS, {
  EventCategory,
} from "../../constants/DEFAULT_EVENT_PHOTOS";

const updateEventAdditionalDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user and validate event ID
    const user = (req as any)["user"] as IUser;

    const { eventId } =
      req.params as UpdateEventAdditionalDetailsInput["params"];

    const updateData = req.body as UpdateEventAdditionalDetailsInput["body"];

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid event ID format",
      });
    }

    //Find and verify event ownership
    const event = await EventModel.findOne({
      _id: eventId,
      hostId: user._id,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have permission",
      });
    }

    //Update contact and order message
    event.additionalDetails.contact = updateData.contact;
    event.additionalDetails.orderMessage = updateData.orderMessage;
    const category = event.basics.category.toLowerCase() as EventCategory;

    //Handle photo deletions first
    if (updateData.deletePhotos) {
      if (updateData.deletePhotos.socialMediaPhoto) {
        event.additionalDetails.socialMediaPhoto =
          DEFAULT_EVENT_PHOTOS[category]?.social ||
          DEFAULT_EVENT_PHOTOS.others.social;
      }

      if (updateData.deletePhotos.eventCoverPhoto) {
        event.additionalDetails.eventCoverPhoto =
          DEFAULT_EVENT_PHOTOS[category]?.cover ||
          DEFAULT_EVENT_PHOTOS.others.cover;
      }

      if (updateData.deletePhotos.additionalPhotos) {
        //Delete by index (sorted descending to avoid index shifting)
        updateData.deletePhotos.additionalPhotos
          .sort((a, b) => b - a) //Sort descending
          .forEach((index) => {
            if (event.additionalDetails.additionalPhotos?.[index]) {
              event.additionalDetails.additionalPhotos.splice(index, 1);
            }
          });
      }
    }

    //Handle new photo uploads
    const uploadTasks = [];

    if (updateData.newPhotos) {
      //Upload social media photo
      if (updateData.newPhotos.socialMediaPhoto) {
        uploadTasks.push(
          uploadBase64(updateData.newPhotos.socialMediaPhoto, "events/social", {
            public_id: `${user._id}-${event._id}-social`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }).then((url) => {
            event.additionalDetails.socialMediaPhoto = url;
          })
        );
      }

      //Upload event cover photo
      if (updateData.newPhotos.eventCoverPhoto) {
        uploadTasks.push(
          uploadBase64(updateData.newPhotos.eventCoverPhoto, "events/covers", {
            public_id: `${user._id}-${event._id}-cover`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }).then((url) => {
            event.additionalDetails.eventCoverPhoto = url;
          })
        );
      }

      //Upload additional photos
      if (updateData.newPhotos.additionalPhotos?.length) {
        const currentCount =
          event.additionalDetails.additionalPhotos?.length || 0;

        updateData.newPhotos.additionalPhotos.forEach((base64, index) => {
          //Only allow up to 3 photos total
          if (currentCount + index < 3) {
            uploadTasks.push(
              uploadBase64(base64, "events/additionals", {
                public_id: `${user._id}-${event._id}-additional-${
                  currentCount + index
                }`,
                overwrite: true,
                invalidate: true,
                resource_type: "auto",
              }).then((url) => {
                if (!event.additionalDetails.additionalPhotos) {
                  event.additionalDetails.additionalPhotos = [];
                }
                event.additionalDetails.additionalPhotos.push(url);
              })
            );
          }
        });
      }
    }

    //Wait for all uploads to complete
    await Promise.all(uploadTasks);

    //Save the updated event
    await event.save();

    res.status(200).json({
      message: "Additional details updated successfully",
    });
  } catch (error) {
    console.error("Update additional details error:", error);
    res.status(500).json({
      message: "Update additional details failed",
    });
  }
};

export default updateEventAdditionalDetails;
