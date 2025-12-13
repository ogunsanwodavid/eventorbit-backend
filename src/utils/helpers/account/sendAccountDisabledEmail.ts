import { Request } from "express";

import { User } from "../../../mongoose/models/user";

import fs from "fs/promises";

import handlebars from "handlebars";

import path from "path";

import juice from "juice";

import { Resend } from "resend";

const sendAccountDisabledEmail = async (req: Request, to: string) => {
  //Env. variabes
  const resendAPIKey = process.env.RESEND_API_KEY;

  //Throw error if any env variable is missing
  if (!resendAPIKey) throw new Error("Missing Resend API key");

  //Create resend transport
  const resend = new Resend(resendAPIKey);

  //Client URL
  const clientUrl = req.headers.origin || req.headers.referer;

  //Check for user
  const user = await User.findOne({ email: to });

  //Throw error if user not found
  if (!user) throw new Error("User not found");

  //Recepient's info
  const { firstName, organizationName } = user;

  //Format date
  const currentDate = new Date();
  const formattedDate = currentDate
    .toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos", // WAT
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .replace(/,(\s+\d+)/, "$1"); // Format: EG Tuesday, May 27, 2025, 02:40 PM WAT

  //Load and compile template
  const templatePath = path.join(
    process.cwd(),
    "src/templates/account/disable-account.hbs"
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = handlebars.compile(templateContent);

  //Data for template
  const templateData = {
    name: `${firstName || organizationName}`,
    formattedDate,
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
    to: [to],
    subject: "Your Account Has Been Disabled",
    html: htmlWithInlinedCss,
  });
};

export default sendAccountDisabledEmail;
