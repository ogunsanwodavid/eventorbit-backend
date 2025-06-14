import QRCode from "qrcode";

import { uploadStream } from "../../../config/cloudinary";

const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) throw new Error("Missing client url in .env");

async function generateQRCodeForTicket(orderId: string, ticketCode: string) {
  try {
    //Create verification URL
    const verificationUrl = `${clientUrl}/tickets/validate/${ticketCode}`;

    //Generate QR code as Buffer
    const qrBuffer = await QRCode.toBuffer(verificationUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 500,
      margin: 1,
      color: {
        dark: "#000000", // QR code color
        light: "#FFFFFF00", // Transparent background
      },
    });

    //Upload to Cloudinary
    const qrCodeUrl = await uploadStream(
      qrBuffer,
      "eventorbit/tickets/qr-codes",
      {
        public_id: `ticket_${orderId}_${ticketCode}`,
        format: "png",
        transformation: [
          { width: 500, crop: "scale" },
          { background: "white" },
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
