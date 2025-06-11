import nodemailer from "nodemailer";

import { User } from "../../../mongoose/models/user";

export const sendVerificationEmail = async (to: string, token: string) => {
  //Google gmail API Env. variabes
  const googleAPIEmailUser = process.env.GOOGLE_GMAIL_API_EMAIL_USER;
  const googleAPIEmailPass = process.env.GOOGLE_GMAIL_API_EMAIL_PASS;

  //Throw error if any gmail API Variable is missing
  if (!googleAPIEmailUser) throw new Error("Missing google API Email User");
  if (!googleAPIEmailPass) throw new Error("Missing google API Email Pass");

  //Create nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: googleAPIEmailUser,
      pass: googleAPIEmailPass,
    },
  });

  //Client-side url
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  //Check for user
  const user = await User.findOne({ email: to });

  //Throw error if user not found
  if (!user) throw new Error("User not found");

  //Recepient's info
  const { firstName, organizationName } = user;

  //Send mail
  await transporter.sendMail({
    from: `"EventOrbit" <${process.env.GOOGLE_GMAIL_API_MAIL_USER}>`,
    to,
    subject: "Events await! Please confirm your account.",
    html: `<p>Hey ${
      firstName || organizationName
    },</p><p>We've finished setting up your EventOrbit account. Just <a href="${url}" style="display:inline;color:#007bff;text-decoration: none;">confirm your email</a> to get started!</p>`,
  });
};
