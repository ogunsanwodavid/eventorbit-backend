import mongoose, { Document } from "mongoose";

export type UserType = "individual" | "organization";

export interface IUser extends Document {
  userType: UserType;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email: string;
  password: string;
  isVerified: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    userType: {
      type: String,
      enum: ["individual", "organization"],
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    organizationName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Custom validation logic
userSchema.pre("validate", function (next) {
  if (this.userType === "individual") {
    if (!this.firstName || !this.lastName) {
      return next(new Error("Individuals must have firstName and lastName"));
    }
  } else if (this.userType === "organization") {
    if (!this.organizationName) {
      return next(new Error("Organizations must have organizationName"));
    }
  }
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
