import { z } from "zod";

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
]);

export default TicketTypeSchema;
