import { User } from "../../../mongoose/models/user";

import fs from "fs/promises";

import handlebars from "handlebars";

import path from "path";

import juice from "juice";

import { Resend } from "resend";

import getSafeRedirect from "./getSafeRedirect";

const sendPasswordResetEmail = async (
  to: string,
  token: string,
  pageRedirect?: string
) => {
  //Env. variabes
  const clientUrl = process.env.CLIENT_URL;
  const resendAPIKey = process.env.RESEND_API_KEY;

  //Throw error if any env variable is missing
  if (!clientUrl) throw new Error("Missing client url in .env");
  if (!resendAPIKey) throw new Error("Missing Resend API key");

  //Create resend transport
  const resend = new Resend(resendAPIKey);

  //Encoded page redirect url
  const encodedRedirect = encodeURIComponent(getSafeRedirect(pageRedirect));

  //Client-side password reset url
  const passwordResetUrl = `${clientUrl}/set-password?token=${token}&redirect=${encodedRedirect}`;

  //Check for user
  const user = await User.findOne({ email: to });

  //Throw error if user not found
  if (!user) throw new Error("User not found");

  //Recepient's info
  const { firstName, organizationName } = user;

  //Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src/templates/auth/forgot-password.hbs"
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
  await resend.emails.send({
    from: "EventOrbit <no-reply@davidogunsanwo.site>",
    to: [user.email],
    subject: "Reset your password",
    html: htmlWithInlinedCss,
  });
};

export default sendPasswordResetEmail;
