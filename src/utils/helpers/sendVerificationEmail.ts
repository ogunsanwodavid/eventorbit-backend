import nodemailer from "nodemailer";

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

  //Send mail
  await transporter.sendMail({
    from: `"EventOrbit" <${process.env.GOOGLE_GMAIL_API_MAIL_USER}>`,
    to,
    subject: "Verify your email",
    html: `<p>Please click the following link to verify your email:</p><a href="${url}">${url}</a>`,
  });
};
