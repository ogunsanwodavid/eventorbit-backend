import { Schema, model, Document, Types } from "mongoose";

//================== CUSTOM TYPES AND INTERFACES ==================
export type QuestionPer = "ticket" | "order";

export type QuestionType =
  | "shortText"
  | "longText"
  | "dropdown"
  | "checkboxes"
  | "checkbox"
  | "waiver";

export type QuestionAppliesTo = "all" | String[];

export interface Question {
  _id: Types.ObjectId;
  per: QuestionPer;
  type: QuestionType;
  required: boolean;
  labelTitle: String;
  text?: String;
  options?: String[];
  appliesTo: QuestionAppliesTo;
  isImmutable: boolean;
  isVisible: boolean;
}

//================== CHECKOUT QUESTIONS MAIN INTERFACE ==================
export interface ICheckoutQuestions extends Document {
  eventId: Schema.Types.ObjectId;
  questions: Question[];
}

//================= SUB SCHEMAS =================
const QuestionAppliesToSchema = {
  type: Schema.Types.Mixed,
  required: true,
  default: "all",
  validate: {
    validator: function (value: QuestionAppliesTo) {
      return (
        value === "all" ||
        (Array.isArray(value) &&
          value.every((item) => typeof item === "string"))
      );
    },
    message: 'QuestionAppliesTo must be "all" or an array of strings',
  },
};

const QuestionSchema = new Schema<Question>({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId(), // Auto-generate
  },
  per: { type: String, enum: ["ticket", "order"], required: true },
  type: {
    type: String,
    enum: [
      "shortText",
      "longText",
      "dropdown",
      "checkboxes",
      "checkbox",
      "waiver",
    ],
    required: true,
  },
  required: { type: Boolean, default: false },
  labelTitle: { type: String, required: true },
  text: { type: String },
  options: { type: [String] },
  appliesTo: QuestionAppliesToSchema,
  isImmutable: { type: Boolean, default: false, immutable: true },
  isVisible: { type: Boolean, default: true },
});

//================= MAIN SCHEMA =================
const CheckoutQuestionsSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    questions: { type: [QuestionSchema], required: true },
  },
  { timestamps: true }
);

//================= SCHEMA VALIDATIONS =================
//::Waiver must have text
QuestionSchema.path("text").validate(function (value) {
  return this.type !== "waiver" || (value && typeof value === "string");
}, "Waiver questions must include text");

//::Checkboxes/dropdown must have options
QuestionSchema.path("options").validate(function (value) {
  return (
    !["checkboxes", "dropdown"].includes(this.type) ||
    (Array.isArray(value) && value.length > 0)
  );
}, "Checkbox/dropdown questions require at least one option");

export const CheckoutQuestionsModel = model<ICheckoutQuestions>(
  "CheckoutQuestions",
  CheckoutQuestionsSchema
);
