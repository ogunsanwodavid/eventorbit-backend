import { z } from "zod";

import validateSchema from "../validateSchema";

const createEventSchemaValidation = validateSchema(
  z
    .object({
      body: z.object({
        status: z.enum(["live", "drafted", "expired"], {
          required_error: "Status is required",
          invalid_type_error: 'Status must be "live", "drafted" or "expired"',
        }),
        type: z.enum(["regular", "timed-entry"], {
          required_error: "Event type is required",
          invalid_type_error: 'Event type must be "regular" or "timed-entry"',
        }),
        basics: z.object({
          name: z.string({ required_error: "Event name is required" }).min(1),
          description: z
            .string({ required_error: "Description is required" })
            .min(1),
          category: z.string({ required_error: "Category is required" }).min(1),
          visibility: z.enum(["public", "unlisted"], {
            required_error: "Visibility is required",
          }),
          startTime: z
            .object({
              hours: z.number().min(0).max(23),
              minutes: z.number().min(0).max(59),
              timeZone: z.string().min(1),
            })
            .optional(),
          endTime: z
            .object({
              hours: z.number().min(0).max(23),
              minutes: z.number().min(0).max(59),
              timeZone: z.string().min(1),
            })
            .optional(),
          location: z.object({
            isVirtual: z.boolean(),
            address: z.string().min(1).optional(),
            venueName: z.string().min(1).optional(),
            organizerAddress: z.string().min(1).optional(),
            connectionDetails: z.string().min(1).optional(),
          }),
        }),
        schedules: z
          .array(
            z.object({
              startDate: z.union([
                z.date(),
                z
                  .string()
                  .datetime()
                  .transform((str) => new Date(str)),
                z
                  .string()
                  .regex(/^\d{4}-\d{2}-\d{2}$/)
                  .transform((str) => new Date(str)),
              ]),
              endDate: z
                .union([
                  z.date(),
                  z
                    .string()
                    .datetime()
                    .transform((str) => new Date(str)),
                  z
                    .string()
                    .regex(/^\d{4}-\d{2}-\d{2}$/)
                    .transform((str) => new Date(str)),
                ])
                .optional(),
              timeSlots: z
                .array(
                  z.object({
                    startTime: z.object({
                      hours: z.number().min(0).max(23),
                      minutes: z.number().min(0).max(59),
                      timeZone: z.string().min(1),
                    }),
                    endTime: z.object({
                      hours: z.number().min(0).max(23),
                      minutes: z.number().min(0).max(59),
                      timeZone: z.string().min(1),
                    }),
                  })
                )
                .min(1),
              repeatDays: z
                .array(
                  z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"])
                )
                .optional(),
            })
          )
          .optional(),
        tickets: z.object({
          types: z
            .array(
              z.object({
                type: z.enum(["Paid", "Free", "Donation"]),
                name: z.string().min(1),
                quantity: z.number().min(1).optional(),
                price: z.number().min(0).optional(),
                minDonation: z.number().min(0).optional(),
                fee: z.number().min(0).optional(),
              })
            )
            .min(1),
          urgency: z.object({
            indicate: z.boolean(),
            percentageSold: z.number().min(60).max(100),
          }),
          currencies: z.object({
            buy: z.string().min(1),
            receive: z.string().min(1),
          }),
          refundPolicy: z.string().min(1),
        }),
        additionalDetails: z.object({
          contact: z.string().min(1),
          orderMessage: z.string().min(1),
          socialMediaPhoto: z.string().min(1),
          eventCoverPhoto: z.string().min(1),
          additionalPhotos: z.array(z.string()).optional(),
        }),
      }),
    })
    .superRefine((data, ctx) => {
      const { type, basics, schedules } = data.body;

      // Validate regular events must have start/end times
      if (type === "regular") {
        if (!basics.startTime || !basics.endTime) {
          if (!basics.startTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["body", "basics", "startTime"],
              message: "Regular events require start time",
            });
          }
          if (!basics.endTime) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["body", "basics", "endTime"],
              message: "Regular events require end time",
            });
          }
        }
      }

      // Validate timed-entry events must have schedules
      if (type === "timed-entry") {
        if (!schedules || schedules.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "schedules"],
            message: "Timed-entry events require at least one schedule",
          });
        }
      }

      //Validate that virtual events have organizer's address and connection details
      if (basics.location.isVirtual) {
        if (
          !basics.location.organizerAddress ||
          !basics.location.connectionDetails
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "basics", "location"],
            message:
              "Virtual events require organizer's address and connection details",
          });
        }
      }

      //Validate that non-virtual events have address and venue's name
      if (!basics.location.isVirtual) {
        if (!basics.location.address || !basics.location.venueName) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body", "basics", "location"],
            message: "Virtual events require address and venue",
          });
        }
      }
    })
);

export default createEventSchemaValidation;
