import express from "express";

import cookieParser from "cookie-parser";

import connectDB from "./database/mongoose";

import session from "express-session";

import MongoStore from "connect-mongo";

import passport from "passport";

import "./config/passport"; //Import passport config file

import { v2 as cloudinary } from "cloudinary";

//Configure environmental variables
import dotenv from "dotenv";
dotenv.config();

//Import routes
import authRoutes from "./routes/auth";
import accountRoutes from "./routes/account";
import profileRoutes from "./routes/profile";
import emailPreferencesRoutes from "./routes/emailPreferences";
import eventsRoutes from "./routes/events";

const app = express();

//Port which app runs or 5000
const PORT = process.env.PORT || 5000;

//Mongo URI
const mongoURI = process.env.MONGO_URI!;

//Express session secret
const expressSessionSecret = process.env.SESSION_SECRET!;

//Cloudinary credentials
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME!;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY!;
const cloudinarySecretKey = process.env.CLOUDINARY_API_SECRET!;

//Set up express app
app.use(express.json());

//Set up cookie parser
app.use(cookieParser());

//Set up express session
app.use(
  session({
    secret: expressSessionSecret!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      //secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: MongoStore.create({
      mongoUrl: mongoURI!,
      collectionName: "sessions",
    }),
  })
);

//Cloudinary config
cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinarySecretKey,
});

//Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

//Utilize routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/email-preferences", emailPreferencesRoutes);
app.use("/api/events", eventsRoutes);

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
