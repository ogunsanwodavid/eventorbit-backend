import { z } from "zod";

import validateSchema from "../validateSchema";

import { base64ImageSchema } from "../base64";

const PhotoUpdateSchema = z.object({
  socialMediaPhoto: base64ImageSchema.optional(),
  eventCoverPhoto: base64ImageSchema.optional(),
  additionalPhotos: z.array(base64ImageSchema).max(3).optional(),
});

const PhotoDeletionSchema = z.object({
  socialMediaPhoto: z.literal(true).optional(),
  eventCoverPhoto: z.literal(true).optional(),
  additionalPhotos: z.array(z.number().int().min(0).max(2)).optional(),
});

export const updateEventAdditionalDetailsSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
  body: z
    .object({
      contact: z.string().min(1, "Contact information is required"),
      orderMessage: z.string().min(1, "Order message is required"),
      newPhotos: PhotoUpdateSchema.optional(),
      deletePhotos: PhotoDeletionSchema.optional(),
    })
    .refine(
      (data) => data.newPhotos || data.deletePhotos,
      "Either newPhotos or deletePhotos must be provided"
    ),
});

const updateEventAdditionalDetailsSchemaValidation = validateSchema(
  updateEventAdditionalDetailsSchema
);

export type UpdateEventAdditionalDetailsInput = z.infer<
  typeof updateEventAdditionalDetailsSchema
>;

export default updateEventAdditionalDetailsSchemaValidation;
