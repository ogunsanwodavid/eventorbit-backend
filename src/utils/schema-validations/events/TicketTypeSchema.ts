import { z } from "zod";

const TicketTypeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Paid"),
    name: z.string(),
    quantity: z.coerce.number().min(1).optional(),
    price: z.coerce.number().min(0),
    fee: z.coerce.number().min(0).optional(),
    sold: z.number().optional(),
  }),
  z.object({
    type: z.literal("Free"),
    name: z.string(),
    quantity: z.coerce.number().min(1).optional(),
    fee: z.coerce.number().min(0).optional(),
    sold: z.number().optional(),
  }),
  z.object({
    type: z.literal("Donation"),
    name: z.string(),
    quantity: z.coerce.number().min(1).optional(),
    minDonation: z.coerce.number().min(0),
    fee: z.coerce.number().min(0).optional(),
    sold: z.number().optional(),
  }),
]);

export default TicketTypeSchema;
