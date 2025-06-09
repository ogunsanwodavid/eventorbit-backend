import { z } from "zod";

import validateSchema from "../validateSchema";

//Create update schema that preserves sold count
const TicketUpdateSchema = z
  .object({
    _id: z.string().optional(),
  })
  .extend({
    type: z.enum(["paid", "free", "donation"]).optional(),
    name: z.string().min(1).optional(),
    quantity: z.coerce.number().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    fee: z.coerce.number().min(0).optional().nullish(),
    minDonation: z.coerce.number().min(0).optional(),
  });

//Main schema
export const updateEventTicketsSchema = z.object({
  params: z.object({
    eventId: z.string().min(1),
  }),
  body: z
    .object({
      types: z.object({
        updates: z.array(TicketUpdateSchema).min(1),
        deletionIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
      }),
      urgency: z
        .object({
          indicate: z.coerce.boolean(),
          percentageSold: z.coerce.number().min(60).max(100).optional(),
        })
        .superRefine((data, ctx) => {
          if (data.indicate && data.percentageSold === undefined) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "percentageSold is required when indicate is true",
              path: ["percentageSold"],
            });
          }
        }),
      currencies: z.object({
        buy: z.string().length(3),
        receive: z.string().length(3),
      }),
      refundPolicy: z.string(),
    })
    .refine(
      (data) =>
        data.types.updates.length > 0 ||
        (data.types.deletionIds && data.types.deletionIds.length > 0),
      {
        message: "Must provide updates or deletions",
        path: ["body"],
      }
    ),
});

export type UpdateEventTicketsInput = z.infer<typeof updateEventTicketsSchema>;

export default validateSchema(updateEventTicketsSchema);
