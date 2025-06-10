import { z } from "zod";

import validateSchema from "../validateSchema";

import DateStringSchema from "../DateStringSchema";

//============ SUB-SCHEMAS ============
const DurationSchema = z
  .object({
    startDate: DateStringSchema.transform((val) => new Date(val)),
    endDate: DateStringSchema.transform((val) => new Date(val)),
    scheduleId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate >= data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
      });
    }
  });

const CheckoutResponseSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").trim(),
  response: z.union([
    z.string().min(1, "Response cannot be empty").trim(),
    z.array(z.string().min(1, "Response item cannot be empty")),
  ]),
});

const TicketSchema = z
  .object({
    _id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
    type: z.enum(["free", "paid", "donation"]),
    name: z.string(),
    price: z.number().min(0.01).optional(),
    fee: z.number().optional(),
    quantityPurchased: z.number().int().min(1),
    attendee: z.object({
      name: z.string().trim().min(1, "Attendee name is required"),
      email: z.string().email("Invalid attendee email address"),
    }),
    checkoutResponses: z.array(CheckoutResponseSchema),
  })
  .superRefine((data, ctx) => {
    if (data.type === "paid" && !data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price is required for paid tickets",
      });
    }

    if (data.type === "donation" && !data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price is required for donation tickets",
      });
    }
  });

//============ MAIN-SCHEMAS ============
const ProcessOrderSchema = z.object({
  params: z.object({
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
  }),
  body: z.object({
    paymentCredentials: z.object({
      cardName: z.string().min(1),
      cardNumber: z
        .string()
        .regex(/^\d{13,19}$/, "Card number must be 13-19 digits"),
      expiry: z
        .string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format"),
      cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits"),
    }),
    duration: DurationSchema,
    order: z.object({
      checkoutResponses: z.array(CheckoutResponseSchema),
    }),
    tickets: z.array(TicketSchema),
    discountCode: z.string().optional(),
  }),
});

const processOrderSchemaValidation = validateSchema(ProcessOrderSchema);

export type ProcessOrderInput = z.infer<typeof ProcessOrderSchema>;

export default processOrderSchemaValidation;
