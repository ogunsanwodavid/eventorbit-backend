import mongoose, { Document } from "mongoose";

import { Profile } from "./profile";

import generateProfileSlug from "../../utils/helpers/auth/generateProfileSlug";

export type UserType = "individual" | "organization";

export interface IUser extends Document {
  userType: UserType;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email: string;
  password?: string;
  isVerified: boolean;
  isDisabled: boolean;
  isGoogle?: boolean;
  profilePicture?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  location?: string;
  hasLocationBeenManuallyUpdatedByUser: boolean;
  policies?: { termsAndConditions: string; privacyPolicy: string };
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
      required: function () {
        return !this.isGoogle;
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isGoogle: {
      type: Boolean,
      default: false,
    },
    profilePicture: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    location: {
      type: String,
    },
    hasLocationBeenManuallyUpdatedByUser: {
      type: Boolean,
      default: false,
    },
    policies: {
      termsAndConditions: { type: String },
      privacyPolicy: { type: String },
    },
  },
  { timestamps: true }
);

//Custom validation logic
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

//Custom on save logic
//::Clear firstName and lastName if organization
//::Clear organizationName if individual
userSchema.pre("save", async function (next) {
  if (this.isModified("userType")) {
    if (this.userType === "organization") {
      this.firstName = undefined;
      this.lastName = undefined;
    } else if (this.userType === "individual") {
      this.organizationName = undefined;
    }
  }
  next();
});

//Auto-create Profile on User creation
userSchema.post("save", async function (doc: IUser, next) {
  try {
    const existingProfile = await Profile.findOne({ userId: doc._id });

    //::If profile doesnt exist before
    //::Create new profile
    //::Ensure profile slug is unique
    if (!existingProfile) {
      let profileSlug = generateProfileSlug(doc);
      let attempt = 0;

      //Return error if cant generate unique profile slug after 5 attempts
      while (await Profile.findOne({ "info.profileSlug": profileSlug })) {
        profileSlug = generateProfileSlug(doc);
        attempt++;
        if (attempt > 5)
          throw new Error("Unable to generate unique profile slug");
      }

      await Profile.create({
        userId: doc._id,
        isDisabled: doc.isDisabled,
        info: {
          firstName: doc.firstName,
          lastName: doc.lastName,
          organizationName: doc.organizationName,
          userType: doc.userType,
          profileSlug,
          description: "",
        },
        images: {
          profilePicture: doc.profilePicture,
        },
      });
    }
    next();
  } catch (error) {
    console.error("Error creating Profile:", error);
    next(new Error("Error creating Profile"));
  }
});

//Sync User to Profile
//::update changes to firstName, lastName, orgName, userType and profile pic to Profile
userSchema.post("save", async function (doc: IUser, next) {
  try {
    const update: any = {
      isDisabled: doc.isDisabled,
      "info.firstName":
        doc.userType === "individual" ? doc.firstName : undefined,
      "info.lastName": doc.userType === "individual" ? doc.lastName : undefined,
      "info.organizationName":
        doc.userType === "organization" ? doc.organizationName : undefined,
      "info.userType": doc.userType,
      "images.profilePicture": doc.profilePicture,
    };
    await Profile.updateOne({ _id: doc._id }, { $set: update });
    next();
  } catch (error) {
    console.error("Error syncing User to Profile:", error);
    next(new Error("Error syncing User to Profile"));
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
