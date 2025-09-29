import { NextFunction, Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { UpdateEventAdditionalDetailsInput } from "../../utils/schema-validations/events/updateEventAdditionalDetailsSchemaValidation";

import { uploadBase64 } from "../../config/cloudinary";

import DEFAULT_EVENT_PHOTOS, {
  EventCategory,
} from "../../constants/events/DEFAULT_EVENT_PHOTOS";

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

    //Event category
    const category = event.basics.category.toLowerCase() as EventCategory;

    //Update contact and order message
    event.additionalDetails.contact = updateData.contact;
    event.additionalDetails.orderMessage = updateData.orderMessage;

    //Handle upload tasks
    const uploadTasks: Promise<any>[] = [];

    //Social Media Photo
    if (updateData.socialMediaPhoto) {
      if (updateData.socialMediaPhoto.startsWith("data:image")) {
        uploadTasks.push(
          uploadBase64(updateData.socialMediaPhoto, "events/social", {
            public_id: `${user._id}-${event._id}-social`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }).then((url) => {
            event.additionalDetails.socialMediaPhoto = url;
          })
        );
      } else {
        event.additionalDetails.socialMediaPhoto = updateData.socialMediaPhoto; //Keep https
      }
    } else {
      //Fallback to default
      event.additionalDetails.socialMediaPhoto =
        DEFAULT_EVENT_PHOTOS[category]?.social ||
        DEFAULT_EVENT_PHOTOS.others.social;
    }

    //Event Cover Photo
    if (updateData.eventCoverPhoto) {
      if (updateData.eventCoverPhoto.startsWith("data:image")) {
        uploadTasks.push(
          uploadBase64(updateData.eventCoverPhoto, "events/covers", {
            public_id: `${user._id}-${event._id}-cover`,
            overwrite: true,
            invalidate: true,
            resource_type: "auto",
          }).then((url) => {
            event.additionalDetails.eventCoverPhoto = url;
          })
        );
      } else {
        event.additionalDetails.eventCoverPhoto = updateData.eventCoverPhoto;
      }
    } else {
      event.additionalDetails.eventCoverPhoto =
        DEFAULT_EVENT_PHOTOS[category]?.cover ||
        DEFAULT_EVENT_PHOTOS.others.cover;
    }

    //Additional Photos
    if (updateData.additionalPhotos?.length) {
      const currentPhotos: string[] = [];

      updateData.additionalPhotos.forEach((photo, index) => {
        if (photo.startsWith("data:image")) {
          uploadTasks.push(
            uploadBase64(photo, "events/additionals", {
              public_id: `${user._id}-${event._id}-additional-${index}`,
              overwrite: true,
              invalidate: true,
              resource_type: "auto",
            }).then((url) => {
              currentPhotos.push(url);
            })
          );
        } else {
          currentPhotos.push(photo);
        }
      });

      event.additionalDetails.additionalPhotos = currentPhotos.slice(0, 3); //Max of 3 images
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
