import path from "path";

import QRCode from "qrcode";

import sharp from "sharp";

import { uploadStream } from "../../../config/cloudinary";

const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) throw new Error("Missing client url in .env");

async function generateQRCodeForTicket(orderId: string, ticketCode: string) {
  try {
    //Create verification URL
    const verificationUrl = `${clientUrl}/tickets/validate/${ticketCode}`;

    //Logo configuration
    const LOGO_CONFIG = {
      path: path.join(__dirname, "../../../assets/global/white-teal-logo.png"),
      size: 100, //Width/height in pixels (20% of 500px QR code)
      position: (500 - 100) / 2, //Center position calculation
    };

    //Generate QR code as Buffer
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 500,
      margin: 2,
      color: {
        dark: "#008080", //Teal color for QR modules
        light: "#FFFFFF", //White background
      },
    });

    //Process QR code with logo
    let finalBuffer: Buffer;
    try {
      //Resize logo and convert to buffer
      const logoBuffer = await sharp(LOGO_CONFIG.path)
        .resize(LOGO_CONFIG.size, LOGO_CONFIG.size)
        .toBuffer();

      finalBuffer = await sharp(qrBuffer)
        .flatten({ background: "#FFFFFF" })
        .composite([
          {
            input: logoBuffer,
            top: LOGO_CONFIG.position,
            left: LOGO_CONFIG.position,
          },
        ])
        .toBuffer();
    } catch (logoError) {
      console.log(`Using plain QR (logo not found at: ${LOGO_CONFIG.path})`);
      finalBuffer = await sharp(qrBuffer)
        .flatten({ background: "#FFFFFF" })
        .toBuffer();
    }

    //Upload to Cloudinary
    const qrCodeUrl = await uploadStream(
      finalBuffer,
      "eventorbit/tickets/qr-codes",
      {
        public_id: `ticket_${orderId}_${ticketCode}`,
        format: "png",
        transformation: [
          { width: 500, crop: "scale" },
          { background: "white" },
          { quality: "auto:best" }, //Better quality preservation
        ],
      }
    );

    return qrCodeUrl;
  } catch (error) {
    console.error("QR generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}

export default generateQRCodeForTicket;
