import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { IEvent } from "../../mongoose/models/event";

import nodemailer from "nodemailer";

import fs from "fs/promises";

import handlebars from "handlebars";

import path from "path";

import juice from "juice";

const sendCreatedEventEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  //Env. variabes
  const googleAPIEmailUser = process.env.GOOGLE_GMAIL_API_EMAIL_USER;
  const googleAPIEmailPass = process.env.GOOGLE_GMAIL_API_EMAIL_PASS;
  const clientUrl = process.env.CLIENT_URL;

  //Throw error if any env variable is missing
  if (!googleAPIEmailUser) throw new Error("Missing google API Email User");
  if (!googleAPIEmailPass) throw new Error("Missing google API Email Pass");
  if (!clientUrl) throw new Error("Missing client url in .env");

  //Create nodemailer transport
  const transporter = nodemailer.createTransport({
    port: 2525,
    service: "gmail",
    auth: {
      user: googleAPIEmailUser,
      pass: googleAPIEmailPass,
    },
  });

  //Get user object from request
  const user = (req as any)["user"] as IUser;

  //Get event object from request
  const event = (req as any)["event"] as IEvent;

  //Throw error if user / event not found
  if (!user) throw new Error("User not found");
  if (!event) throw new Error("Event not found");

  //Recepient's info
  const { firstName, organizationName } = user;

  //Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src/templates/events/created-event.hbs"
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

  //Data for template
  const templateData = {
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
    clientUrl,
    year: new Date().getFullYear(),
  };

  //Generate HTML
  const htmlToSend = template(templateData);

  //Juice html template to use inline css
  const htmlWithInlinedCss = juice(htmlToSend);

  //Send mail
  await transporter.sendMail({
    from: `"EventOrbit" <${googleAPIEmailUser}>`,
    to: user.email,
    subject: `${event.basics.name} has been posted successfully`,
    html: htmlWithInlinedCss,
  });

  next();
};

export default sendCreatedEventEmail;
