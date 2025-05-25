import { Request, Response, Router } from "express";

import updateEmailHandler from "../controllers/account/updateEmail";

import deleteSession from "../middleware/auth/deleteSession";

import updateEmailSchemaValidation from "../utils/schema-validations/account/updateEmailSchemaValidation";

//Define router
const router = Router();

//Update user's email and delete current session to force re-login
router.patch(
  "/update-email/:id",
  updateEmailSchemaValidation,
  updateEmailHandler,
  deleteSession,
  (req: Request, res: Response) => {
    res.status(200).json({
      message: "Email updated and verification sent",
    });
  }
);

export default router;
