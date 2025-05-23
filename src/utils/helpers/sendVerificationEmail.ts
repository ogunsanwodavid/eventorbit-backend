import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to: string, token: string) => {
  //Google gmail API Env. variabes
  const googleAPIClientId = process.env.GOOGLE_GMAIL_API_CLIENT_ID;
  const googleAPIClientSecret = process.env.GOOGLE_GMAIL_API_CLIENT_SECRET;
  const googleAPIRefreshToken = process.env.GOOGLE_GMAIL_API_REFRESH_TOKEN;

  //Throw error if any gmail API Variable is missing
  if (!googleAPIClientId) throw new Error("Missing google API Client ID");
  if (!googleAPIClientSecret)
    throw new Error("Missing google API Client Secret");
  if (!googleAPIRefreshToken)
    throw new Error("Missing google API Refresh Token");

  //Create nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "ogunsanwodavid123@gmail.com",
      clientId: googleAPIClientId,
      clientSecret: googleAPIClientSecret,
      refreshToken: googleAPIRefreshToken,
      accessToken:
        "ya29.a0AW4XtxhrqR3L4lAnWDMrYcwt_gDsSwrhr0XB84jUPfHa4vBeDuflAcmBz-FKiW_z3VSq9SQzgSSLrQQnn8JHF3Zq3M7SDuf4l9IqwtmTfoIBmClutYqksBOgjjxbPWwXXx1wBaJjm0zCxTcj2Ak5pDoZvv_WVb1pMkG7grIFaCgYKAcwSARISFQHGX2Miua1cJQAgyqX-0W17qc0e1Q0175",
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
