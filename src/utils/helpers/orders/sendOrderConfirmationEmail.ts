import { IUser } from "../../../mongoose/models/user";

import { IEvent } from "../../../mongoose/models/event";

import { IProfile } from "../../../mongoose/models/profile";

import { FormattedTicket } from "../../../middleware/orders/formatTickets";

import fs from "fs/promises";

import handlebars from "handlebars";

import path from "path";

import juice from "juice";

import { Resend } from "resend";

const sendOrderConfirmationEmail = async (
  user: IUser,
  event: IEvent,
  organizerProfile: IProfile,
  formattedTickets: FormattedTicket[],
  pdfBuffer: Buffer
) => {
  //Env. variabes
  const clientUrl = process.env.CLIENT_URL;
  const resendAPIKey = process.env.RESEND_API_KEY;

  //Throw error if any env variable is missing
  if (!clientUrl) throw new Error("Missing client url in .env");
  if (!resendAPIKey) throw new Error("Missing Resend API key");

  //Create resend transport
  const resend = new Resend(resendAPIKey);

  //Recepient's info
  const { firstName, organizationName } = user;

  //Event's url
  const eventUrl = `${clientUrl}/events/${event.alias}`;

  //Check if tickers are more than one
  const hasMultipleTickets = formattedTickets.length > 1;

  //Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src/templates/tickets/confirm-order.hbs"
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  //Formatted start date
  const formattedStartDate = (event: IEvent): string => {
    if (event.type === "regular" && event.duration?.startDate) {
      return new Date(event.duration.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Africa/Lagos",
      });
    } else if (event.type === "timed-entry" && event.schedules?.length) {
      const earliestDate = event.schedules
        .map((s) => new Date(s.startDate))
        .reduce((min, date) => (date < min ? date : min));
      return earliestDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "Africa/Lagos",
      });
    }
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Africa/Lagos",
    });
  };

  //Location Google Maps URL
  const createGoogleMapsUrl = (venue: string, address: string): string => {
    const query = encodeURIComponent(`${venue}, ${address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  //Get organizer's name from profile
  const getOrganizerName = (organizer: IProfile): string => {
    return String(
      organizer.info.userType === "organization"
        ? organizer.info.organizationName
        : `${organizer.info.firstName} ${organizer.info.lastName}`
    );
  };

  //Organizer's url
  const organizerUrl = `${clientUrl}/users/${organizerProfile.info.profileSlug}`;

  //Data for template
  const templateData = {
    formattedTickets,
    name: `${firstName || organizationName}`,
    eventName: event.basics.name,
    eventCoverPhoto: event.additionalDetails.eventCoverPhoto,
    formattedStartDate,
    venueName: event.basics.location.venueName,
    connectionDetails: event.basics.location.connectionDetails,
    locationGoogleMapsUrl:
      event.basics.location.venueName && event.basics.location.address
        ? createGoogleMapsUrl(
            event.basics.location.venueName,
            event.basics.location.address
          )
        : "",
    eventUrl,
    additionalInfo: event.additionalDetails.orderMessage,
    organizerName: getOrganizerName(organizerProfile),
    organizerContact: event.additionalDetails.contact,
    organizerUrl,
    clientUrl,
    hasMultipleTickets,
    year: new Date().getFullYear(),
  };

  //Generate HTML
  const htmlToSend = template(templateData);

  //Juice html template to use inline css
  const htmlWithInlinedCss = juice(htmlToSend);

  //Send mail
  await resend.emails.send({
    from: "EventOrbit <no-reply@davidogunsanwo.site>",
    to: [user.email],
    subject: `Here ${hasMultipleTickets ? "are" : "is"} your ${
      hasMultipleTickets ? "tickets" : "ticket"
    } to ${event.basics.name}`,
    html: htmlWithInlinedCss,
    attachments: [
      {
        filename: `${hasMultipleTickets ? "Tickets" : "Ticket"}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};

export default sendOrderConfirmationEmail;
