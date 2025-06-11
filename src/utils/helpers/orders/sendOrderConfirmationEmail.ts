import nodemailer from "nodemailer";

import { IUser, User } from "../../../mongoose/models/user";

import { IEvent } from "../../../mongoose/models/event";

import { FormattedTicket } from "../../../middleware/orders/formatTickets";

const sendOrderConfirmationEmail = async (
  user: IUser,
  event: IEvent,
  formattedTickets: FormattedTicket[],
  pdfBuffer: Buffer
) => {
  //Google gmail API Env. variabes
  const googleAPIEmailUser = process.env.GOOGLE_GMAIL_API_EMAIL_USER;
  const googleAPIEmailPass = process.env.GOOGLE_GMAIL_API_EMAIL_PASS;

  //Throw error if any gmail API Variable is missing
  if (!googleAPIEmailUser) throw new Error("Missing google API Email User");
  if (!googleAPIEmailPass) throw new Error("Missing google API Email Pass");

  //Client side url
  //::Throw error if missing
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) throw new Error("Missing client url in .env");

  //Create nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleAPIEmailUser,
      pass: googleAPIEmailPass,
    },
  });

  //Recepient's info
  const { firstName, organizationName } = user;

  //Event's url
  const eventUrl = `${clientUrl}/events/${event.alias}`;

  //Check if tickers are more than one
  const hasMultipleTickets = formattedTickets.length > 1;

  //Send mail
  await transporter.sendMail({
    from: `"EventOrbit" <${process.env.GOOGLE_GMAIL_API_MAIL_USER}>`,
    to: user.email,
    subject: `Here ${hasMultipleTickets ? "are" : "is"} your ${
      hasMultipleTickets ? "tickets" : "ticket"
    } to ${event.basics.name}`,
    html: `<h2 style="font-weight:bold;font-size:20px">Hey ${
      firstName || organizationName
    }, you've reserved your spot to ${event.basics.name}</h2>
    <p style="margin-top:25px">This is your order confirmation for <a href="${eventUrl}" style="display:inline;color:#007bff;text-decoration: none;">${
      event.basics.name
    }</a>. Please see the attached PDF for more details.</p>`,
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
