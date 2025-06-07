import { z } from "zod";

import validateSchema from "../validateSchema";

export const QuestionAppliesToSchema = z
  .union([z.literal("all"), z.array(z.string()).nonempty()])
  .default("all");

export const QuestionSchema = z
  .object({
    per: z.enum(["ticket", "order"]),
    type: z.enum([
      "shortText",
      "longText",
      "dropdown",
      "checkboxes",
      "checkbox",
      "waiver",
    ]),
    required: z.boolean().default(false),
    labelTitle: z.string().min(1, "Label is required"),
    text: z
      .string()
      .optional()
      .refine((value) => !value || typeof value === "string", {
        message: "Waiver questions must include text",
        path: ["text"],
      }),
    options: z.array(z.string()).optional(),
    appliesTo: QuestionAppliesToSchema,
    isImmutable: z.boolean().default(false).optional(),
    isVisible: z.boolean().default(true).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "waiver" && !data.text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Waiver questions must include text",
        path: ["text"],
      });
    }
    if (
      ["checkboxes", "dropdown"].includes(data.type) &&
      (!data.options || data.options.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Checkbox/dropdown questions require at least one option",
        path: ["options"],
      });
    }
  });

const updateCheckoutQuestionsSchema = z.object({
  params: z.object({
    eventId: z.string(),
  }),
  body: z.array(QuestionSchema),
});

const updateCheckoutQuestionsSchemaValidation = validateSchema(
  updateCheckoutQuestionsSchema
);

export type UpdateCheckoutQuestionsInput = z.infer<
  typeof updateCheckoutQuestionsSchema
>;

export default updateCheckoutQuestionsSchemaValidation;
