import { z } from "zod";

import validateSchema from "../validateSchema";

const getAttendeesSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(30).default(20).optional(),
    search: z.string().trim().min(1).optional(),
    sort: z.enum(["asc", "desc"]).default("desc").optional(),
  }),
});

const getAttendeesSchemaValidation = validateSchema(getAttendeesSchema);

export type GetAttendeesInput = z.infer<typeof getAttendeesSchema>;

export default getAttendeesSchemaValidation;
