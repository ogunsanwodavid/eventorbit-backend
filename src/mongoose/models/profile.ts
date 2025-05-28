import { Schema, model, Document } from "mongoose";

import { UserType } from "./user";
import { NextFunction } from "express";

interface IProfile extends Document {
  userId: Schema.Types.ObjectId;
  isDisabled: boolean;
  info: {
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    userType: UserType;
    description?: string;
    profileSlug: string;
    isPrivate: boolean;
    isABusinessSeller: boolean;
    businessAddress?: string;
    businessEmail?: string;
    businessPhoneNumber?: string;
  };
  socialUrls?: {
    website?: string;
    facebook?: string;
    x?: string;
    instagram?: string;
  };
  images?: {
    profilePicture: string;
    coverPhoto: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    info: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      organizationName: { type: String, trim: true },
      userType: {
        type: String,
        enum: ["individual", "organization"],
        required: true,
      },
      description: {
        type: String,
        trim: true,
      },
      profileSlug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
      isABusinessSeller: { type: Boolean, default: false },
      businessAddress: { type: String, trim: true },
      businessEmail: { type: String, trim: true },
      businessPhoneNumber: { type: String, trim: true },
    },
    socialUrls: {
      website: { type: String, trim: true },
      facebook: { type: String, trim: true },
      x: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    images: {
      profilePicture: { type: String, trim: true },
      coverPhoto: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

//Custom validation for business seller
profileSchema.pre("validate", function (next) {
  const info = this.info;
  if (info.isABusinessSeller) {
    if (
      !info.organizationName ||
      !info.businessEmail ||
      !info.businessPhoneNumber
    ) {
      return next(
        new Error(
          "Business sellers must have organizationName, businessEmail, and businessPhoneNumber"
        )
      );
    }
  }
  next();
});

//Sync Profile changes to User
profileSchema.post("save", async function (doc: IProfile, next) {
  try {
    //::If user type is organization , remove first and last name
    //::If individual, remove organization name
    const update: any = {
      firstName:
        doc.info.userType === "individual" ? doc.info.firstName : undefined,
      lastName:
        doc.info.userType === "individual" ? doc.info.lastName : undefined,
      organizationName:
        doc.info.userType === "organization"
          ? doc.info.organizationName
          : undefined,
      userType: doc.info.userType,
    };

    //::update changes to user object
    await model("User").updateOne({ _id: doc.userId }, { $set: update });
    next();
  } catch (error) {
    console.error("Error syncing Profile to User:", error);
    next(new Error("Error syncing Profile to User"));
  }
});

//Custom pre-updateOne logic
//::Clear business email, address, and phone number if not a business seller
//::Clear organizationName if individual
//::Clear firstName and lastName if organization
profileSchema.pre("updateOne", async function (next) {
  try {
    const update = this.getUpdate() as { $set?: { info?: any } };

    if (update.$set?.info) {
      const { isABusinessSeller, userType } = update.$set.info;

      // Clear business fields if not a business seller
      if (isABusinessSeller === false) {
        update.$set.info.businessEmail = undefined;
        update.$set.info.businessAddress = undefined;
        update.$set.info.businessPhoneNumber = undefined;
      }

      // Clear organizationName if individual
      if (userType === "individual") {
        update.$set.info.organizationName = undefined;
      }

      // Clear first and last names if organization
      if (userType === "organization") {
        update.$set.info.firstName = undefined;
        update.$set.info.lastName = undefined;
      }

      // Ensure other fields are preserved
      this.setUpdate(update);
    }
  } catch (error) {
    console.error("Error in Profile pre-updateOne hook:", error);
  }
});

export const Profile = model<IProfile>("Profile", profileSchema);
