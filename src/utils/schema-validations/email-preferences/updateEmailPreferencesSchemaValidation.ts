import { z } from "zod";
import validateSchema from "../validateSchema";

// Shared boolean field with consistent error message
const booleanField = (fieldName: string) =>
  z.boolean({
    required_error: `${fieldName} is required`,
    invalid_type_error: `${fieldName} must be a boolean`,
  });

// Sub-schemas for better organization
const allEmailsSchema = z.object({
  unsubscribe: booleanField("unsubscribe"),
});

const confirmationEmailsSchema = z.object({
  tickets: booleanField("tickets"),
});

const bookingEmailsSchema = z.object({
  eventReminder: booleanField("eventReminder"),
  cancellationAndRefund: booleanField("cancellationAndRefund"),
  paymentIssues: booleanField("paymentIssues"),
  ticketTransfer: booleanField("ticketTransfer"),
  waitlistNotis: booleanField("waitlistNotis"),
});

const accountEmailsSchema = z.object({
  yourAccount: booleanField("yourAccount"),
  messages: booleanField("messages"),
});

const hostEmailsSchema = z.object({
  bookingNotis: booleanField("bookingNotis"),
  yourEvent: booleanField("yourEvent"),
});

const marketingEmailsSchema = z.object({
  weeklyUpdates: booleanField("weeklyUpdates"),
  others: booleanField("others"),
});

// Main schema
const updateEmailPreferencesSchemaValidation = validateSchema(
  z.object({
    body: z
      .object({
        allEmails: allEmailsSchema,
        confirmationEmails: confirmationEmailsSchema,
        bookingEmails: bookingEmailsSchema,
        accountEmails: accountEmailsSchema,
        hostEmails: hostEmailsSchema,
        marketingEmails: marketingEmailsSchema,
      })
      .strict(), // No extra fields allowed
  })
);

export default updateEmailPreferencesSchemaValidation;
