import { z } from "zod";

import validateSchema from "../validateSchema";

import { base64ImageSchema } from "../base64";

import LocationSchema from "./LocationSchema";
import TimeSchema from "./TimeSchema";
import TicketTypeSchema from "./TicketTypeSchema";

/* const TimeSchema = z.object({
  hours: z.coerce.number().min(0).max(23),
  minutes: z.coerce.number().min(0).max(59),
  timeZone: z.string(),
});

export const LocationSchema = z
  .object({
    isVirtual: z.coerce.boolean(),
    address: z.string().optional(),
    venueName: z.string().optional(),
    organizerAddress: z.string().optional(),
    connectionDetails: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isVirtual) {
      if (!data.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required for physical events",
          path: ["address"],
        });
      }
      if (!data.venueName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Venue name is required for physical events",
          path: ["venueName"],
        });
      }
    } else {
      if (!data.organizerAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Organizer address is required for virtual events",
          path: ["organizerAddress"],
        });
      }
      if (!data.connectionDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Connection details are required for virtual events",
          path: ["connectionDetails"],
        });
      }
    }
  });

const TicketTypeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Paid"),
    name: z.string(),
    quantity: z.coerce.number().min(1),
    price: z.coerce.number().min(0),
    fee: z.coerce.number().min(0).optional(),
  }),
  z.object({
    type: z.literal("Free"),
    name: z.string(),
    quantity: z.coerce.number().min(1),
    fee: z.coerce.number().min(0).optional(),
  }),
  z.object({
    type: z.literal("Donation"),
    name: z.string(),
    minDonation: z.coerce.number().min(0),
    fee: z.coerce.number().min(0).optional(),
  }),
]); */

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
      startTime: TimeSchema.optional(),
      endTime: TimeSchema.optional(),
      schedules: z.array(z.any()).optional(),
      tickets: z.object({
        types: z.array(TicketTypeSchema).min(1),
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
        socialMediaPhoto: base64ImageSchema,
        eventCoverPhoto: base64ImageSchema,
        additionalPhotos: z.array(base64ImageSchema).max(3).optional(),
      }),
    })
    .superRefine((data, ctx) => {
      if (data.type === "regular") {
        if (!data.startTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start time is required for regular events",
            path: ["startTime"],
          });
        }
        if (!data.endTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End time is required for regular events",
            path: ["endTime"],
          });
        }
        if (data.startTime && data.endTime) {
          if (
            data.startTime.hours > data.endTime.hours ||
            (data.startTime.hours === data.endTime.hours &&
              data.startTime.minutes >= data.endTime.minutes)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End time must be after start time",
              path: ["endTime"],
            });
          }
        }
      }
    }),
});

const createEventSchemaValidation = validateSchema(createEventSchema);

export type CreateEventInput = z.infer<typeof createEventSchema>;

export default createEventSchemaValidation;
