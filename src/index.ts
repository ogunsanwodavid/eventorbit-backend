import express from "express";

import cookieParser from "cookie-parser";

import connectDB from "./database/mongoose";

//Configure environmental variables
import dotenv from "dotenv";
dotenv.config();

//Import routes
import authRoutes from "./routes/authRoutes";

const app = express();

//Port which app runs or 5000
const PORT = process.env.PORT || 5000;

//Use app, packages and routes
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

//Mongo URI
const mongoURI = process.env.MONGO_URI;

//Connect to MongoDB and start server
const start = async () => {
  if (!mongoURI) {
    throw new Error("MONGO_URI not defined in .env");
  }

  await connectDB(mongoURI!);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

start();
