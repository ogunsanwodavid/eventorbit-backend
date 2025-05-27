import nodemailer from "nodemailer";

import { User } from "../../../mongoose/models/user";

const sendAccountDisabledEmail = async (to: string) => {
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

  //Check for user
  const user = await User.findOne({ email: to });

  //Throw error if user not found
  if (!user) throw new Error("User not found");

  //Recepient's info
  const { firstName, organizationName } = user;

  // Get current date and time for email
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
    .replace(/,(\s+\d+)/, "$1"); // Format: Tuesday, May 27, 2025, 02:40 PM WAT

  //Send mail
  await transporter.sendMail({
    from: `"EventOrbit" <${process.env.GOOGLE_GMAIL_API_MAIL_USER}>`,
    to,
    subject: "Your Account Has Been Disabled",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f8f8; padding: 10px; text-align: center; }
    .content { padding: 20px; }
    .footer { font-size: 12px; color: #777; text-align: center; padding: 10px; }
    a { color: #007bff; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Your Account Has Been Disabled</h2>
    </div>
    <div class="content">
      <p>Dear ${firstName || organizationName},</p>
      <p>We wanted to inform you that your account with EventOrbit has been disabled as of ${formattedDate}. This action was taken at your request.</p>
      <p>While your account is disabled, you will not be able to log in or access our services. Your data remains securely stored, and you can request reactivation by contacting our <a href="mailto:ogunsanwodavid123@gmail.com">support team</a>.</p>
      <p>If you believe this was an error or have any questions, please <a href="mailto:ogunsanwodavid123@gmail.com">reach out to us</a> or reply to this email.</p>
    </div>
    <div class="footer">
      <p>Best regards,<br>The EventOrbit Team<br>
    </div>
  </div>
</body>
</html>`,
  });
};

export default sendAccountDisabledEmail;
