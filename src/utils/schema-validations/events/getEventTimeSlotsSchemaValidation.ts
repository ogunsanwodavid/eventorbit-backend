import { z } from "zod";

import validateSchema from "../validateSchema";

const getEventTimeSlotsSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
});

const getEventTimeSlotsSchemaValidation = validateSchema(
  getEventTimeSlotsSchema
);

export type GetEventTimeSlotsInput = z.infer<typeof getEventTimeSlotsSchema>;

export default getEventTimeSlotsSchemaValidation;
