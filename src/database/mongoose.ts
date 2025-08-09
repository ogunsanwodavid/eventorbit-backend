import mongoose from "mongoose";

const connectDB = async (uri: string) => {
  try {
    //Check if connection is on production
    const isProduction = process.env.NODE_ENV === "production";

    await mongoose.connect(uri, {
      //Only use TLS in production
      tls: isProduction,
      tlsAllowInvalidCertificates: false, // Avoid enabling in prod unless necessary
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
