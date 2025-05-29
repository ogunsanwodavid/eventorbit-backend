import { Schema, model, Document } from "mongoose";

interface IEmailPreferences extends Document {
  userId: Schema.Types.ObjectId;
  allEmails: {
    unsubscribe: boolean;
  };
  confirmationEmails: {
    tickets: boolean;
  };
  bookingEmails: {
    eventReminder: boolean;
    cancellationAndRefund: boolean;
    paymentIssues: boolean;
    ticketTransfer: boolean;
    waitlistNotis: boolean;
  };
  accountEmails: {
    yourAccount: boolean;
    messages: boolean;
  };
  hostEmails: {
    bookingNotis: boolean;
    yourEvent: boolean;
  };
  marketingEmails: {
    weeklyUpdates: boolean;
    others: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const emailPreferencesSchema = new Schema<IEmailPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  allEmails: {
    unsubscribe: {
      type: Boolean,
      default: false,
    },
  },
  confirmationEmails: {
    tickets: {
      type: Boolean,
      default: true,
    },
  },
  bookingEmails: {
    eventReminder: {
      type: Boolean,
      default: true,
    },
    cancellationAndRefund: {
      type: Boolean,
      default: true,
    },
    paymentIssues: {
      type: Boolean,
      default: true,
    },
    ticketTransfer: {
      type: Boolean,
      default: true,
    },
    waitlistNotis: {
      type: Boolean,
      default: true,
    },
  },
  accountEmails: {
    yourAccount: {
      type: Boolean,
      default: true,
    },
    messages: {
      type: Boolean,
      default: true,
    },
  },
  hostEmails: {
    bookingNotis: {
      type: Boolean,
      default: true,
    },
    yourEvent: {
      type: Boolean,
      default: true,
    },
  },
  marketingEmails: {
    weeklyUpdates: {
      type: Boolean,
      default: true,
    },
    others: {
      type: Boolean,
      default: true,
    },
  },
});

export const EmailPreferences = model<IEmailPreferences>(
  "EmailPreferences",
  emailPreferencesSchema
);
