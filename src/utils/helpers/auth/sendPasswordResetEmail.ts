import nodemailer from "nodemailer";

import { User } from "../../../mongoose/models/user";

import fs from "fs/promises";

import handlebars from "handlebars";

import path from "path";

import juice from "juice";

const sendPasswordResetEmail = async (to: string, token: string) => {
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

  //Client-side password reset url
  const passwordResetUrl = `${clientUrl}/set-password?token=${token}`;

  //Check for user
  const user = await User.findOne({ email: to });

  //Throw error if user not found
  if (!user) throw new Error("User not found");

  //Recepient's info
  const { firstName, organizationName } = user;

  //Load and compile template
  const templatePath = path.join(
    __dirname,
    "../../../templates/auth/forgot-password.hbs"
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  //Data for template
  const templateData = {
    name: `${firstName || organizationName}`,
    passwordResetUrl,
    clientUrl,
    year: new Date().getFullYear(),
  };

  //Generate HTML
  const htmlToSend = template(templateData);

  //Juice html template to use inline css
  const htmlWithInlinedCss = juice(htmlToSend);

  //Send mail
  await transporter.sendMail({
    from: `"EventOrbit" <${process.env.GOOGLE_GMAIL_API_MAIL_USER}>`,
    to,
    subject: "Reset your password",
    html: htmlWithInlinedCss,
  });
};

export default sendPasswordResetEmail;
