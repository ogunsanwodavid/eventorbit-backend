import { Document, Schema, model } from "mongoose";

import * as moment from "moment-timezone";

// ================== CUSTOM TYPES AND INTERFACES ==================
export type EventType = "regular" | "timed-entry";

export type EventStatus = "live" | "drafted" | "expired";

export type EventVisibility = "public" | "unlisted";

export interface ITime {
  hours: number;
  minutes: number;
  timeZone: string;
}

export type WeekDay = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export type TimeSlot = {
  startTime: ITime;
  endTime: ITime;
};

export interface Schedule {
  startDate: Date;
  endDate?: Date;
  timeSlots: TimeSlot[];
  repeatDays?: WeekDay[];
}

export interface TicketType {
  _id: Schema.Types.ObjectId;
  type: "Paid" | "Free" | "Donation";
  name: string;
  sold: number;
  quantity?: number;
  price?: number;
  minDonation?: number;
  fee?: number;
}

// ================== EVENT MAIN INTERFACE ==================
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
  duration?: TimeSlot;
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
  };
  additionalDetails: {
    contact: string;
    orderMessage: string;
    socialMediaPhoto: string;
    eventCoverPhoto: string;
    additionalPhotos?: string[];
  };
}

// ================== SUB-SCHEMAS ==================
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
    min: 60,
    max: 100,
    required: function () {
      return (this as any).indicate === true;
    },
  },
});

const TimeSlotSchema = new Schema<TimeSlot>({
  startTime: { type: TimeSchema, required: true },
  endTime: {
    type: TimeSchema,
    required: true,
    validate: {
      validator: function (this: TimeSlot, endTime: ITime) {
        const start = this.startTime;
        if (start.hours > endTime.hours) return false;
        if (start.hours === endTime.hours && start.minutes >= endTime.minutes)
          return false;
        return true;
      },
      message: "End time must be after start time",
    },
  },
});

const ScheduleSchema = new Schema<Schedule>({
  startDate: { type: Date, required: true },
  endDate: {
    type: Date,
    validate: {
      validator: function (this: Schedule, endDate: Date) {
        return !endDate || endDate > this.startDate;
      },
      message: "End date must be after start date",
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
    enum: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
  },
});

const TicketTypeSchema = new Schema<TicketType>({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  type: { type: String, enum: ["Paid", "Free", "Donation"], required: true },
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
      return this.type === "Paid";
    },
  },
  minDonation: {
    type: Number,
    min: 0,
    required: function () {
      return this.type === "Donation";
    },
  },
  fee: { type: Number, min: 0 },
});

// ================== MAIN SCHEMA ==================
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
    duration: TimeSlotSchema,
    schedules: { type: [ScheduleSchema] },
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
    },
    additionalDetails: {
      contact: { type: String, required: true },
      orderMessage: { type: String, required: true },
      socialMediaPhoto: { type: String },
      eventCoverPhoto: { type: String },
      additionalPhotos: { type: [String] },
    },
  },
  { timestamps: true }
);

// ====== ADD CUSTOM VALIDATION ======
EventSchema.pre("validate", function (next) {
  const event = this as any;

  try {
    //Rule 1: Regular events require times
    if (event.type === "regular") {
      const missingTimes = [];
      if (!event.duration.startTime) missingTimes.push("startTime");
      if (!event.duration.endTime) missingTimes.push("endTime");

      if (missingTimes.length > 0) {
        throw new Error(
          `Regular events require ${missingTimes.join(" and ")} in duration`
        );
      }

      //Validate end time is after start time for regular events
      if (event.duration.startTime && event.duration.endTime) {
        const start = event.duration.startTime;
        const end = event.duration.endTime;
        if (
          start.hours > end.hours ||
          (start.hours === end.hours && start.minutes >= end.minutes)
        ) {
          throw new Error("Event end time must be after start time");
        }
      }
    }

    //Rule 2: Timed-entry requires schedules
    if (event.type === "timed-entry") {
      if (!event.schedules || event.schedules.length === 0) {
        throw new Error("Timed-entry events require at least one schedule");
      }

      // Validate all schedules have valid time slots
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
        if (ticket.type === "Paid" && ticket.price === undefined) {
          throw new Error("Paid tickets require a price");
        }
        if (ticket.type === "Donation" && ticket.minDonation === undefined) {
          throw new Error("Donation tickets require a minimum donation amount");
        }
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

//Add indexes
//EventSchema.index({ status: 1, type: 1 });
EventSchema.index({ "basics.name": "text", "basics.description": "text" });

export const EventModel = model<IEvent>("Event", EventSchema);
