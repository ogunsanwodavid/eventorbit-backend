import { Request, Response } from "express";

import { Profile } from "../../mongoose/models/profile";

import { GetProfileBySlugInput } from "../../utils/schema-validations/profile/getProfileBySlugSchemaValidation";

const getProfileBySlug = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get slug from request params
    const { slug } = req.params as GetProfileBySlugInput["params"];

    //Find profile by alias
    const profile = await Profile.findOne({
      "info.profileSlug": slug,
    })
      .select("-__v -createdAt -updatedAt") //Exclude unnecessary fields
      .lean();

    //Return error
    //::if profile not found
    //::if user is disabled
    if (!profile || !profile.isDisabled) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully.",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

export default getProfileBySlug;
