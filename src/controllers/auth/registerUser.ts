import { Request, Response } from "express";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import dotenv from "dotenv";

import { IUser, User } from "../../mongoose/models/user";

import { sendVerificationEmail } from "../../utils/helpers/sendVerificationEmail";

//Configure the env variables
dotenv.config();

//JWT Secret key
const jwtSecret = process.env.JWT_SECRET!;

//Register user function
const registerUser = async (
  req: Request<{}, {}, IUser>,
  res: Response
): Promise<any> => {
  try {
    const { userType, firstName, lastName, organizationName, email, password } =
      req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use." });

    // Validate based on userType :: if the user is an individual or organization
    if (userType === "individual" && (!firstName || !lastName)) {
      return res.status(400).json({
        message: "First name and last name are required for individuals.",
      });
    }

    if (userType === "organization" && !organizationName) {
      return res
        .status(400)
        .json({ message: "Organization name is required for organizations." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      userType,
      firstName,
      lastName,
      organizationName,
      email,
      password: hashedPassword,
    });

    // Generate verification token
    const token = jwt.sign({ userId: newUser._id }, jwtSecret, {
      expiresIn: "1d",
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export default registerUser;
