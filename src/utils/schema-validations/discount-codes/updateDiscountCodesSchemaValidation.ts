import { z } from "zod";

import validateSchema from "../validateSchema";

const AmountUnitSchema = z.enum(["percentage", "currency"]);

const AmountSchema = z.object({
  value: z.number(),
  unit: AmountUnitSchema,
});

const UsesSchema = z.object({
  maxUse: z.number().nonnegative().nullable(),
});

const CodeSchema = z.object({
  _id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId")
    .optional(),
  isActive: z.boolean(),
  code: z.string().regex(/^[a-zA-Z0-9]+$/, "Code must be alphanumeric"),
  amount: AmountSchema,
  uses: UsesSchema,
});

const UpdateDiscountCodesSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
  body: z.array(CodeSchema),
});

const updateDiscountCodesSchemaValidation = validateSchema(
  UpdateDiscountCodesSchema
);

export type UpdateDiscountCodesInput = z.infer<
  typeof UpdateDiscountCodesSchema
>;

export default updateDiscountCodesSchemaValidation;
