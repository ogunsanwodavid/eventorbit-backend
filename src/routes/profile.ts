import { Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";
import multerUploadProfilePicture from "../middleware/profile/multerUploadProfilePicture";
import multerUploadCoverPhoto from "../middleware/profile/multerUploadCoverPhoto";

import updateProfileInfoSchemaValidation from "../utils/schema-validations/profile/updateProfileInfoSchemaValidation";
import updateProfileSocialUrlsSchemaValidation from "../utils/schema-validations/profile/updateProfileSocialUrlsSchemaValidation";
import getProfileBySlugSchemaValidation from "../utils/schema-validations/profile/getProfileBySlugSchemaValidation";

import getProfileHandler from "../controllers/profile/getProfile";
import getProfileBySlugHandler from "../controllers/profile/getProfileBySlug";
import updateProfileInfoHandler from "../controllers/profile/updateProfileInfo";
import updateProfileSocialUrlsHandler from "../controllers/profile/updateProfileSocialUrls";
import uploadProfilePictureHandler from "../controllers/profile/uploadProfilePicture";
import uploadCoverPhotoHandler from "../controllers/profile/uploadCoverPhoto";

//Define router
const router = Router();

//Fetch user's profile
//::Protected endpoint
router.get("/get", checkAuthStatus, getProfileHandler);

//Fetch a profile by it's slug
router.get(
  "/get-by-slug/:slug",
  getProfileBySlugSchemaValidation,
  getProfileBySlugHandler
);

//Upload profile picture
//::Protected endpoint
//::Pick file with multer middleware
router.patch(
  "/upload-profile-pic",
  checkAuthStatus,
  multerUploadProfilePicture,
  uploadProfilePictureHandler,
  (_, res: Response) => {
    res.status(200).json({
      message: "Profile picture uploaded successfully",
    });
  }
);

//Upload cover photo
//::Protected endpoint
//::Pick file with multer middleware
router.patch(
  "/upload-cover-photo",
  checkAuthStatus,
  multerUploadCoverPhoto,
  uploadCoverPhotoHandler,
  (_, res: Response) => {
    res.status(200).json({
      message: "Cover photo uploaded successfully",
    });
  }
);

//Update profile info
//::Protected endpoint
router.patch(
  "/update-profile-info",
  checkAuthStatus,
  updateProfileInfoSchemaValidation,
  updateProfileInfoHandler,
  (_, res: Response) => {
    res.status(200).json({
      message: "Profile info updated successfully",
    });
  }
);

//Update social URLS
//::Protected endpoint
router.patch(
  "/update-profile-social-urls",
  checkAuthStatus,
  updateProfileSocialUrlsSchemaValidation,
  updateProfileSocialUrlsHandler,
  (_, res: Response) => {
    res.status(200).json({
      message: "Profile social URLs updated successfully",
    });
  }
);

export default router;
