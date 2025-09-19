import { Document, Schema, model, Types } from "mongoose";

import * as moment from "moment-timezone";

//================== CUSTOM TYPES AND INTERFACES ==================
export type EventType = "regular" | "timed-entry";

export type EventStatus = "live" | "drafted" | "expired";

export type EventVisibility = "public" | "unlisted";

export interface ITime {
  hours: number;
  minutes: number;
  timeZone: string;
}

export type WeekDay = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type TimeSlot = {
  startTime: ITime;
  duration: {
    value: number;
    unit: "hours" | "mins";
  };
};

export interface Duration {
  startDate: Date;
  endDate: Date;
  timeZone: string;
}

export interface Schedule {
  _id: Types.ObjectId;
  startDate: Date;
  endDate?: Date;
  timeSlots: TimeSlot[];
  repeatDays?: WeekDay[];
  sold: number;
}

export interface TicketType {
  _id: Schema.Types.ObjectId;
  type: "paid" | "free" | "donation";
  name: string;
  sold: number;
  quantity?: number;
  price?: number;
  minDonation?: number;
  fee?: number;
}

//================== EVENT MAIN INTERFACE ==================
export interface IEvent extends Document {
  hostId: Schema.Types.ObjectId;
  status: EventStatus;
  type: EventType;
  alias: string;
  basics: {
    name: string;
    description: string;
    category: string;
    visibility: EventVisibility;
    location: {
      isVirtual: boolean;
      address?: string;
      venueName?: string;
      organizerAddress?: string;
      connectionDetails?: string;
    };
  };
  duration?: Duration;
  schedules?: Schedule[];
  tickets: {
    types: TicketType[];
    urgency: {
      indicate: boolean;
      percentageSold?: number;
    };
    currencies: {
      buy: string;
      receive: string;
    };
    refundPolicy: string;
    hasSoldTickets?: {
      type: Boolean;
      default: false;
    };
  };
  additionalDetails: {
    contact: string;
    orderMessage: string;
    socialMediaPhoto?: string;
    eventCoverPhoto?: string;
    additionalPhotos?: string[];
  };
}

//================== SUB-SCHEMAS ==================
const TimeSchema = new Schema<ITime>({
  hours: { type: Number, required: true, min: 0, max: 23 },
  minutes: { type: Number, required: true, min: 0, max: 59 },
  timeZone: {
    type: String,
    required: true,
    validate: {
      validator: (tz: string) => moment.tz.zone(tz) !== null,
      message: "Invalid timezone",
    },
  },
});

const LocationSchema = new Schema({
  isVirtual: { type: Boolean, required: true },
  address: { type: String },
  venueName: { type: String },
  organizerAddress: { type: String },
  connectionDetails: { type: String },
});

const TicketUrgencySchema = new Schema({
  indicate: { type: Boolean, required: true },
  percentageSold: {
    type: Number,
    min: 30,
    max: 100,
    required: function () {
      return (this as any).indicate === true;
    },
  },
});

const DurationSchema = new Schema<Duration>({
  startDate: { type: Date },
  endDate: { type: Date },
  timeZone: { type: String },
});

const TimeSlotSchema = new Schema<TimeSlot>({
  startTime: { type: TimeSchema, required: true },
  duration: {
    value: { type: Number },
    unit: { type: String, enum: ["hours", "mins"] },
  },
});

const ScheduleSchema = new Schema<Schedule>({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId(), // Auto-generate
  },
  startDate: { type: Date, required: true },
  endDate: {
    type: Date,
    validate: {
      validator: function (this: Schedule, endDate: Date) {
        // If there are repeatDays, endDate must exist
        if (this.repeatDays?.length && !endDate) return false;
        // If endDate exists, it must be after startDate
        return !endDate || endDate > this.startDate;
      },
      message: "End date validation error",
    },
  },
  timeSlots: {
    type: [TimeSlotSchema],
    required: true,
    validate: {
      validator: (slots: TimeSlot[]) => slots.length > 0,
      message: "At least one time slot is required",
    },
  },
  repeatDays: {
    type: [String],
    enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
    validate: {
      validator: function (this: Schedule, repeatDays: string[]) {
        //If there's an endDate, at least one repeat day is required
        if (this.endDate && (!repeatDays || repeatDays.length === 0)) {
          return false;
        }
        return true;
      },
      message: "At least one repeat day is required when there's an end date",
    },
  },
  sold: { type: Number, default: 0 },
});

const TicketTypeSchema = new Schema<TicketType>({
  type: { type: String, enum: ["paid", "free", "donation"], required: true },
  name: { type: String, required: true },
  quantity: {
    type: Number,
    min: 1,
  },
  sold: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    min: 0,
    required: function () {
      return this.type === "paid";
    },
  },
  minDonation: {
    type: Number,
    min: 0,
    required: function () {
      return this.type === "donation";
    },
  },
  fee: { type: Number, min: 0 },
});

//================== MAIN SCHEMA ==================
const EventSchema = new Schema(
  {
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["live", "drafted", "expired"],
      default: "drafted",
      index: true,
    },
    type: {
      type: String,
      enum: ["regular", "timed-entry"],
      required: true,
      index: true,
    },
    alias: { type: String, required: true, index: true, unique: true },
    basics: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      category: { type: String, required: true },
      visibility: {
        type: String,
        enum: ["public", "unlisted"],
        required: true,
      },
      location: { type: LocationSchema, required: true },
    },
    duration: { type: DurationSchema, required: false, default: undefined },
    schedules: { type: [ScheduleSchema], required: false, default: undefined },
    tickets: {
      types: {
        type: [TicketTypeSchema],
        required: true,
        validate: {
          validator: (types: TicketType[]) => types.length > 0,
          message: "At least one ticket type is required",
        },
      },
      urgency: { type: TicketUrgencySchema },
      currencies: {
        buy: { type: String, required: true, uppercase: true },
        receive: { type: String, required: true, uppercase: true },
      },
      refundPolicy: { type: String, required: true },
      hasSoldTickets: { type: Boolean },
    },
    additionalDetails: {
      contact: { type: String, required: true },
      orderMessage: { type: String, required: true },
      socialMediaPhoto: { type: String, required: false },
      eventCoverPhoto: { type: String, required: false },
      additionalPhotos: { type: [String], required: false, default: undefined },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//====== VIRTUAL PROPERTY =======
EventSchema.virtual("hasSoldTickets").get(function () {
  return this.tickets!.types.some((ticket) => ticket.sold > 0);
});

//====== PRE-SAVE HOOKS ==========
EventSchema.pre("save", async function (next) {
  try {
    //Update hasSoldTickets based on whether any ticket has sold > 0
    this.tickets!.hasSoldTickets = this.tickets!.types.some(
      (ticket) => ticket.sold > 0
    );
    next();
  } catch (error) {
    console.error(error);
  }
});

//====== ADD CUSTOM VALIDATION ======
EventSchema.pre("validate", function (next) {
  const event = this as any;

  try {
    //Rule 1: Regular events require start and end dates
    if (event.type === "regular") {
      const missingTimes = [];
      if (!event.duration.startDate) missingTimes.push("startDate");
      if (!event.duration.endDate) missingTimes.push("endDate");

      if (missingTimes.length > 0) {
        throw new Error(
          `Regular events require ${missingTimes.join(" and ")} in duration`
        );
      }

      //Validate end time is after start time for regular events
      if (event.duration.startDate && event.duration.endDate) {
        const start = event.duration.startDate;
        const end = event.duration.Date;
        if (start > end) {
          throw new Error("Event end time must be after start time");
        }
      }
    }

    //Rule 2: Timed-entry requires schedules
    if (event.type === "timed-entry") {
      if (!event.schedules || event.schedules.length === 0) {
        throw new Error("Timed-entry events require at least one schedule");
      }

      //Validate all schedules have valid time slots
      const invalidSchedule = event.schedules.find(
        (s: Schedule) => !s.timeSlots || s.timeSlots.length === 0
      );

      if (invalidSchedule) {
        throw new Error("All schedules must contain at least one time slot");
      }
    }

    //Rule 3: Location validation
    if (!event.basics.location.isVirtual) {
      if (!event.basics.location.address || !event.basics.location.venueName) {
        throw new Error("Physical events require address and venue name");
      }
    } else {
      if (
        !event.basics.location.organizerAddress ||
        !event.basics.location.connectionDetails
      ) {
        throw new Error(
          "Virtual events require organizer address and connection details"
        );
      }
    }

    //Rule 4: Ticket validation
    if (event.tickets?.types) {
      for (const ticket of event.tickets.types) {
        if (ticket.type === "paid" && ticket.price === undefined) {
          throw new Error("Paid tickets require a price");
        }
        if (ticket.type === "donation" && ticket.minDonation === undefined) {
          throw new Error("Donation tickets require a minimum donation amount");
        }
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const EventModel = model<IEvent>("Event", EventSchema);
