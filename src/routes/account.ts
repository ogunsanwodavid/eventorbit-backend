import { Request, Response, Router } from "express";

import updateEmailHandler from "../controllers/account/updateEmail";
import updatePasswordHandler from "../controllers/account/updatePassword";

import deleteSession from "../middleware/auth/deleteSession";
import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import updateEmailSchemaValidation from "../utils/schema-validations/account/updateEmailSchemaValidation";
import updatePasswordSchemaValidation from "../utils/schema-validations/account/updatePasswordSchemaValidation";

//Define router
const router = Router();

//Update user's email
//::Protected endpoint
//::Deletes session after completion
router.patch(
  "/update-email/:id",
  checkAuthStatus,
  updateEmailSchemaValidation,
  updateEmailHandler,
  deleteSession,
  (req: Request, res: Response) => {
    res.status(200).json({
      message: "Email updated and verification sent",
    });
  }
);

//Update user's password
//::Protected endpoint
//::Deletes session after completion
router.patch(
  "/update-password/:id",
  checkAuthStatus,
  updatePasswordSchemaValidation,
  updatePasswordHandler,
  deleteSession,
  (req: Request, res: Response) => {
    res.status(200).json({
      message: "Password updated successfully",
    });
  }
);

//Update user's location
//::Protected endpoint

export default router;
