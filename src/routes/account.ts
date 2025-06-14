import { Response, Router } from "express";

import deleteSession from "../middleware/auth/deleteSession";
import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import updateEmailSchemaValidation from "../utils/schema-validations/account/updateEmailSchemaValidation";
import updatePasswordSchemaValidation from "../utils/schema-validations/account/updatePasswordSchemaValidation";
import updateLocationSchemaValidation from "../utils/schema-validations/account/updateLocationSchemaValidation";
import updatePoliciesSchemaValidation from "../utils/schema-validations/account/updatePoliciesSchemaValidation";
import disableAccountSchemaValidation from "../utils/schema-validations/account/disableAccountSchemaValidation";

import getAccountHandler from "../controllers/account/getAccount";
import updateEmailHandler from "../controllers/account/updateEmail";
import updatePasswordHandler from "../controllers/account/updatePassword";
import updateLocationHandler from "../controllers/account/updateLocation";
import updatePoliciesHandler from "../controllers/account/updatePolicies";
import disableAccountHandler from "../controllers/account/disableAccount";

//Define router
const router = Router();

//Fetch user's account
//::Protected endpoint
router.get("/get", checkAuthStatus, getAccountHandler);

//Update user's email
//::Protected endpoint
//::Deletes session after completion
router.patch(
  "/update-email",
  checkAuthStatus,
  updateEmailSchemaValidation,
  updateEmailHandler,
  deleteSession,
  (_, res: Response) => {
    res.status(200).json({
      message: "Email updated and verification sent",
    });
  }
);

//Update user's password
//::Protected endpoint
//::Deletes session after completion
router.patch(
  "/update-password",
  checkAuthStatus,
  updatePasswordSchemaValidation,
  updatePasswordHandler,
  deleteSession,
  (_, res: Response) => {
    res.status(200).json({
      message: "Password updated successfully",
    });
  }
);

//Update user's location
//::Protected endpoint
router.patch(
  "/update-location",
  checkAuthStatus,
  updateLocationSchemaValidation,
  updateLocationHandler,
  (_, res: Response) => {
    res.status(200).json({
      message: "Location updated successfully",
    });
  }
);

//Update user's events' policies
//::Protected endpoint
router.patch(
  "/update-policies",
  checkAuthStatus,
  updatePoliciesSchemaValidation,
  updatePoliciesHandler,
  (_, res: Response) => {
    res.status(200).json({
      message: "Policies updated successfully",
    });
  }
);

//Disable user's account
//::Protected endpoint
//::Deletes session after completion
router.post(
  "/disable",
  checkAuthStatus,
  disableAccountSchemaValidation,
  disableAccountHandler,
  deleteSession,
  (_, res: Response) => {
    res.status(200).json({
      message: "Account disabled successfully",
    });
  }
);

export default router;
