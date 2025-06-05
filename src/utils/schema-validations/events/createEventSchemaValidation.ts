import { z } from "zod";

import validateSchema from "../validateSchema";

import { base64ImageSchema } from "../base64";

import LocationSchema from "./LocationSchema";
import TicketTypeSchema from "./TicketTypeSchema";
import ScheduleSchema from "./ScheduleSchema";
import DurationSchema from "./DurationSchema";

const createEventSchema = z.object({
  body: z
    .object({
      status: z.enum(["live", "drafted", "expired"]).default("drafted"),
      type: z.enum(["regular", "timed-entry"]),
      basics: z.object({
        name: z.string().min(3),
        description: z.string().min(10),
        category: z.string(),
        visibility: z.enum(["public", "unlisted"]),
        location: LocationSchema,
      }),
      duration: DurationSchema.optional(),
      schedules: z.array(ScheduleSchema).min(1).optional(),
      tickets: z.object({
        types: z.array(TicketTypeSchema).min(1, {
          message: "At least one ticket is required",
        }),
        urgency: z
          .object({
            indicate: z.coerce.boolean(),
            percentageSold: z.coerce.number().min(60).max(100).optional(),
          })
          .optional(),
        currencies: z.object({
          buy: z.string().length(3),
          receive: z.string().length(3),
        }),
        refundPolicy: z.string(),
      }),
      additionalDetails: z.object({
        contact: z.string(),
        orderMessage: z.string(),
        socialMediaPhoto: base64ImageSchema.optional(),
        eventCoverPhoto: base64ImageSchema.optional(),
        additionalPhotos: z.array(base64ImageSchema).max(3).optional(),
      }),
    })
    .superRefine((data, ctx) => {
      if (data.type === "regular") {
        const duration = data.duration!;

        if (!duration.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date is required for regular events",
            path: ["startDate"],
          });
        }

        if (!duration.endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date is required for regular events",
            path: ["endDate"],
          });
        }
      }
    }),
});

const createEventSchemaValidation = validateSchema(createEventSchema);

export type CreateEventInput = z.infer<typeof createEventSchema>;

export default createEventSchemaValidation;
