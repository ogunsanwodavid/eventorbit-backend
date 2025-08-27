import { Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import updateEmailPreferencesSchemaValidation from "../utils/schema-validations/email-preferences/updateEmailPreferencesSchemaValidation";

import getEmailPreferencesHandler from "../controllers/email-preferences/getEmailPreferences";
import updateEmailPreferencesHandler from "../controllers/email-preferences/updateEmailPreferences";

//Define router
const router = Router();

//Fetch user's email preferences
//::Protected endpoint
router.get("/get", checkAuthStatus, getEmailPreferencesHandler);

//Update email preferences
//::Protected endpoint
router.patch(
  "/update",
  checkAuthStatus,
  updateEmailPreferencesSchemaValidation,
  updateEmailPreferencesHandler,
  (_, res: Response) => {
    res.status(200).json({
      message: "Email preferences saved successfully",
    });
  }
);

export default router;
