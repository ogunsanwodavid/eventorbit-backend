import express from "express";

import connectDB from "./database/mongoose";

//Configure environmental variables
import dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

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
