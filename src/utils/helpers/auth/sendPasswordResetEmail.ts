import nodemailer from "nodemailer";

import { User } from "../../../mongoose/models/user";

const sendPasswordResetEmail = async (to: string, token: string) => {
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
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

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
    subject: "Reset your password",
    html: `<h1>Did you forget your password?</h1>
    <h3>Hi ${firstName ?? organizationName}, </h3>
    <p>We received a request to reset the password associated with this email address. You can do so by clicking on the link below. This link remains active for 24 hours and invalid once used for reset. If multiple requests were requested, only the recent link is valid.</p>
    <a href="${url}">${url}</a>`,
  });
};

export default sendPasswordResetEmail;
