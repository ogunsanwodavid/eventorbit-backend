import { Document, Schema, model } from "mongoose";

//================== CUSTOM TYPES AND INTERFACES ==================
export type OrderStatus = "failed" | "pending" | "paid" | "cancelled";

export interface Payment {
  total: number;
  subtotal: number;
  fees?: number;
  taxes?: number;
  discount?: number;
  appFees?: number;
  currency: string;
}

export interface CheckoutResponse {
  question: string;
  response: string | string[];
}

//================== ORDER MAIN INTERFACE ==================
export interface IOrder extends Document {
  eventId: Schema.Types.ObjectId;
  buyerId: Schema.Types.ObjectId;
  status: OrderStatus;
  dateOrdering: Date;
  dateAttending: Date;
  itemsQuantity: number;
  payment: Payment;
  checkoutResponses?: CheckoutResponse[];
}

//================== SUB-SCHEMAS ==================
const PaymentSchema = new Schema<Payment>({
  total: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  fees: { type: Number },
  taxes: { type: Number },
  discount: { type: Number },
  appFees: { type: Number },
  currency: { type: String, required: true },
});

const CheckoutResponseSchema = new Schema<CheckoutResponse>({
  question: {
    type: String,
    required: [true, "Question is required"],
  },
  response: {
    type: Schema.Types.Mixed,
    required: [true, "Response is required"],
    validate: {
      validator: function (value: any) {
        //Validate it's either a non-empty string or non-empty string array
        if (typeof value === "string") {
          return value.trim().length > 0;
        }
        if (Array.isArray(value)) {
          return (
            value.length > 0 &&
            value.every(
              (item) => typeof item === "string" && item.trim().length > 0
            )
          );
        }
        return false;
      },
      message: "Response must be a non-empty string or array of strings",
    },
  },
});

//================== MAIN SCHEMA ==================
const OrderSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["failed", "pending", "paid", "cancelled"],
      default: "pending",
      index: true,
    },
    dateOrdering: {
      type: Date,
      required: true,
    },
    dateAttending: {
      type: Date,
      required: true,
    },
    itemsQuantity: {
      type: Number,
      required: true,
    },
    payment: PaymentSchema,
    checkoutResponses: [CheckoutResponseSchema],
  },
  { timestamps: true }
);

export const OrderModel = model<IOrder>("Order", OrderSchema);
