import { NextFunction, Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import updateProfileInfoSchemaValidation from "../utils/schema-validations/profile/updateProfileInfoSchemaValidation";
import updateProfileSocialUrlsSchemaValidation from "../utils/schema-validations/profile/updateProfileSocialUrlsSchemaValidation";

import updateProfileInfoHandler from "../controllers/profile/updateProfileInfo";
import updateProfileSocialUrlsHandler from "../controllers/profile/updateProfileSocialUrls";
import uploadProfilePictureHandler, {
  multerUploadProfilePictureMiddleware,
} from "../controllers/profile/uploadProfilePicture";
import uploadCoverPhotoHandler, {
  multerUploadCoverPhotoMiddleware,
} from "../controllers/profile/uploadCoverPhoto";

//Define router
const router = Router();

//Upload profile picture
//::Protected endpoint
//::Pick file with multer middleware
router.patch(
  "/upload-profile-pic",
  checkAuthStatus,
  multerUploadProfilePictureMiddleware,
  uploadProfilePictureHandler,
  (req: Request, res: Response) => {
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
  multerUploadCoverPhotoMiddleware,
  uploadCoverPhotoHandler,
  (req: Request, res: Response) => {
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
  (req: Request, res: Response) => {
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
  (req: Request, res: Response) => {
    res.status(200).json({
      message: "Profile social URLs updated successfully",
    });
  }
);

export default router;
