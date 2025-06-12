import { Document, Schema, model } from "mongoose";

//================== CUSTOM TYPES AND INTERFACES ==================
export type TicketStatus = "reserved" | "attended" | "cancelled";

export interface Attendee {
  name: string;
  email: string;
}

export interface CheckoutResponse {
  question: string;
  response: string | string[];
}

//================== ORDER MAIN INTERFACE ==================
export interface ITicket extends Document {
  orderId: Schema.Types.ObjectId;
  buyerId: Schema.Types.ObjectId;
  status: TicketStatus;
  name: string;
  code: string;
  qrCode: string;
  startDate: Date;
  endDate: Date;
  timeZone: string;
  value: number;
  attendee: Attendee;
  checkoutResponses?: CheckoutResponse[];
  event: {
    name: string;
    location: {
      address?: string;
      venueName?: string;
      connectionDetails?: string;
    };
    organizerName: string;
    coverPhoto: string;
  };
}

//================== SUB-SCHEMAS ==================
const AttendeeSchema = new Schema<Attendee>({
  name: { type: String, required: true },
  email: { type: String, required: true },
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

const EventLocationSchema = new Schema({
  address: { type: String },
  venueName: { type: String },
  connectionDetails: { type: String },
});

//================== MAIN SCHEMA ==================
const TicketSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
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
    enum: ["reserved", "attended", "cancelled"],
    default: "reserved",
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  timeZone: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  attendee: AttendeeSchema,
  checkoutResponses: [CheckoutResponseSchema],
  event: {
    name: { type: String, required: true },
    location: EventLocationSchema,
    organizerName: { type: String, required: true },
    coverPhoto: {
      type: String,
      required: true,
    },
  },
});

export const TicketModel = model<ITicket>("Ticket", TicketSchema);
