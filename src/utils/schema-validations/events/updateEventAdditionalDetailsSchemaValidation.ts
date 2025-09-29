import { z } from "zod";

import validateSchema from "../validateSchema";

import { base64ImageSchema } from "../base64";

//HTTPS Image URL schema
const httpsImageUrlSchema = z
  .string()
  .url()
  .refine((val) => val.startsWith("https://"), {
    message: "URL must start with https://",
  });

export const updateEventAdditionalDetailsSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
  body: z.object({
    contact: z.string().min(1, "Contact information is required"),
    orderMessage: z.string().min(1, "Order message is required"),
    socialMediaPhoto: z
      .union([base64ImageSchema, httpsImageUrlSchema])
      .optional(),
    eventCoverPhoto: z
      .union([base64ImageSchema, httpsImageUrlSchema])
      .optional(),
    additionalPhotos: z
      .array(z.union([base64ImageSchema, httpsImageUrlSchema]))
      .max(3)
      .optional(),
  }),
});

const updateEventAdditionalDetailsSchemaValidation = validateSchema(
  updateEventAdditionalDetailsSchema
);

export type UpdateEventAdditionalDetailsInput = z.infer<
  typeof updateEventAdditionalDetailsSchema
>;

export default updateEventAdditionalDetailsSchemaValidation;
