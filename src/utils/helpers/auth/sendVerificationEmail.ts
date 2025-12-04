//import nodemailer from "nodemailer";

import { User } from "../../../mongoose/models/user";

import fs from "fs/promises";

import handlebars from "handlebars";

import path from "path";

import juice from "juice";

import { Resend } from "resend";

import getSafeRedirect from "./getSafeRedirect";

export const sendVerificationEmail = async (
  to: string,
  token: string,
  pageRedirect?: string
) => {
  //Env. variabes
  const googleAPIEmailUser = process.env.GOOGLE_GMAIL_API_EMAIL_USER;
  const googleAPIEmailPass = process.env.GOOGLE_GMAIL_API_EMAIL_PASS;
  const clientUrl = process.env.CLIENT_URL;
  const resendAPIKey = process.env.RESEND_API_KEY;

  //Throw error if any env variable is missing
  if (!googleAPIEmailUser) throw new Error("Missing google API Email User");
  if (!googleAPIEmailPass) throw new Error("Missing google API Email Pass");
  if (!clientUrl) throw new Error("Missing client url in .env");
  if (!resendAPIKey) throw new Error("Missing Resend API key");

  //Create nodemailer transport
  /* const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleAPIEmailUser,
      pass: googleAPIEmailPass,
    },
  });
 */
  //Create resend transport
  const resend = new Resend(resendAPIKey);

  //Encoded page redirect url
  const encodedRedirect = encodeURIComponent(getSafeRedirect(pageRedirect));

  //Client-side verification url
  const verificationUrl = `${clientUrl}/verify-email?token=${token}&redirect=${encodedRedirect}`;

  //Check for user
  const user = await User.findOne({ email: to });

  //Throw error if user not found
  if (!user) throw new Error("User not found");

  //Recepient's info
  const { firstName, organizationName } = user;

  //Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src/templates/auth/verify-email.hbs"
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  //Data for template
  const templateData = {
    name: `${firstName || organizationName}`,
    verificationUrl,
    clientUrl,
    year: new Date().getFullYear(),
  };

  //Generate HTML
  const htmlToSend = template(templateData);

  //Juice html template to use inline css
  const htmlWithInlinedCss = juice(htmlToSend);

  //Send mail
  /* await transporter.sendMail({
    from: `"EventOrbit" <${googleAPIEmailUser}>`,
    to,
    subject: "Events await! Please confirm your account.",
    html: htmlWithInlinedCss,
  }); */
  await resend.emails.send({
    from: "EventOrbit <no-reply@davidogunsanwo.site>",
    to: [to],
    subject: "Events await! Please confirm your account.",
    html: htmlWithInlinedCss,
  });
};
