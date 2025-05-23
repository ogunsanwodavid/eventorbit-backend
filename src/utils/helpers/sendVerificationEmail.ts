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
        "ya29.a0AW4Xtxi-qF-Uac-xOwy76vjAhc7rieeOvqUUwfdZxKODym3-10cVD0IXhHgQUkcOa-JnVnUd-gKTrFZA7owRaPips-TOk1nAxqOAe15VCquKWP3ZKnKcKwOnAGHdWCDEtjypDHaYnzz4DKyCQGV1_wduzsV9cBbXj9iOP0SjaCgYKAQ8SARISFQHGX2Mi6SlC-4NHRn_T-_VrN2p9QQ0175",
      expires: 99999999999999,
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
