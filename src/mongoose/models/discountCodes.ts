import { Schema, model, Document, Types } from "mongoose";

//================== CUSTOM TYPES AND INTERFACES ==================
export type AmountUnit = "percentage" | "currency";

export interface Amount {
  value: number;
  unit: AmountUnit;
}

export interface Uses {
  totalUse: number;
  maxUse: number;
}

export interface Code {
  _id: Types.ObjectId; //Stable identifier
  isActive: boolean;
  code: string;
  amount: Amount;
  uses: Uses;
}

//================== DISCOUNT CODES MAIN INTERFACE ==================
export interface IDiscountCode extends Document {
  eventId: Schema.Types.ObjectId;
  codes: Code[];
}

//================= SUB SCHEMAS =================
const AmountSchema = new Schema<Amount>({
  value: { type: Number, required: true },
  unit: { type: String, enum: ["percentage", "currency"], required: true },
});

const UsesSchema = new Schema<Uses>({
  totalUse: { type: Number, required: true, default: 0 },
  maxUse: { type: Number },
});

const CodeSchema = new Schema<Code>({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId(), // Auto-generate
  },
  isActive: { type: Boolean, required: true, default: true },
  code: { type: String, required: true },
  amount: AmountSchema,
  uses: UsesSchema,
});

//================= MAIN SCHEMA =================
const DiscountCodesSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    codes: { type: [CodeSchema], required: true },
  },
  { timestamps: true }
);

//================= SCHEMA VALIDATIONS =================
//::Discount code must be alphanumeric
CodeSchema.path("code").validate(function (value: string) {
  return /^[a-zA-Z0-9]+$/.test(value);
}, "Code must be alphanumeric");

//::Total use cant exceed maxUse
UsesSchema.path("totalUse").validate(function (value: number) {
  if (this.maxUse !== undefined && this.maxUse !== null) {
    return value <= this.maxUse;
  }
  return true;
}, "Total uses cannot exceed maximum uses");

export const DiscountCodesModel = model<IDiscountCode>(
  "DiscountCodes",
  DiscountCodesSchema
);
