import { Schema, model, Document } from "mongoose";

import { UserType } from "./user";

interface IProfile extends Document {
  userId: Schema.Types.ObjectId;
  isDisabled: boolean;
  info: {
    firstName?: string;
    lastName?: string;
    organizationName?: string;
    userType: UserType;
    description?: string;
    profileSlug?: string;
    isPrivate: boolean;
    isABusinessSeller: boolean;
    businessAddress?: string;
    businessEmail?: string;
    businessPhoneNumber?: number;
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
      businessPhoneNumber: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

// Custom validation for business seller
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

export const Profile = model<IProfile>("Profile", profileSchema);
