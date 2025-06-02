import { z } from "zod";

import validateSchema from "../validateSchema";

import LocationSchema from "./LocationSchema";

const updateEventBasicsSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
  body: z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    category: z.string(),
    visibility: z.enum(["public", "unlisted"]),
    location: LocationSchema,
  }),
});

const updateEventBasicsSchemaValidation = validateSchema(
  updateEventBasicsSchema
);

export type UpdateEventBasicsInput = z.infer<typeof updateEventBasicsSchema>;

export default updateEventBasicsSchemaValidation;
