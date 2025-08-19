import { NextFunction, Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import nodemailer from "nodemailer";

import fs from "fs/promises";

import handlebars from "handlebars";

import path from "path";

import juice from "juice";

const sendWelcomeEmail = async (
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
    service: "gmail",
    auth: {
      user: googleAPIEmailUser,
      pass: googleAPIEmailPass,
    },
  });

  //Get user and is existing user status from request
  const user = (req as any).user as IUser & { isExistingUser: boolean };
  const { isExistingUser } = user;

  //Throw error if user not found
  if (!user) throw new Error("User not found");

  //Go to next middleware if user exists
  if (isExistingUser) return next();

  //Recepient's info
  const { firstName, organizationName } = user;

  //Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src/templates/auth/welcome-email.hbs"
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  //Other urls for the template
  const learnMoreUrl = `${clientUrl}/features`;
  const createEventUrl = `${clientUrl}/create`;
  const discoverEventsUrl = `${clientUrl}/explore`;
  const contactUsUrl = `${clientUrl}/contact-us`;

  //Data for template
  const templateData = {
    name: `${firstName || organizationName}`,
    learnMoreUrl,
    createEventUrl,
    discoverEventsUrl,
    contactUsUrl,
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
    subject: `Welcome to EventOrbit ${firstName || organizationName}!`,
    html: htmlWithInlinedCss,
  });

  next();
};

export default sendWelcomeEmail;
