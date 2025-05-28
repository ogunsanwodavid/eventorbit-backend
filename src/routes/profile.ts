import { Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import updateProfileInfoSchemaValidation from "../utils/schema-validations/profile/updateProfileInfoSchemaValidation";
import updateProfileSocialUrlsSchemaValidation from "../utils/schema-validations/profile/updateProfileSocialUrlsSchemaValidation";

import updateProfileInfoHandler from "../controllers/profile/updateProfileInfo";
import updateProfileSocialUrlsHandler from "../controllers/profile/updateProfileSocialUrls";

//Define router
const router = Router();

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
