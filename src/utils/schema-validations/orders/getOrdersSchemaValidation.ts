import { z } from "zod";

import validateSchema from "../validateSchema";

const getOrdersSchema = z.object({
  params: z.object({
    eventId: z.string().min(1, "Event ID is required"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(30).default(20).optional(),
    status: z.enum(["failed", "pending", "paid", "cancelled"]).optional(),
    search: z.string().trim().min(1).optional(),
    sort: z.enum(["asc", "desc"]).default("desc").optional(),
  }),
});

const getOrdersSchemaValidation = validateSchema(getOrdersSchema);

export type GetOrdersInput = z.infer<typeof getOrdersSchema>;

export default getOrdersSchemaValidation;
