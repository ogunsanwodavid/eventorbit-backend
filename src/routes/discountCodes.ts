import { Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import getDiscountCodesSchemaValidation from "../utils/schema-validations/discount-codes/getDiscountCodesSchemaValidation";
import updateDiscountCodesSchemaValidation from "../utils/schema-validations/discount-codes/updateDiscountCodesSchemaValidation";

import getDiscountCodesHandler from "../controllers/discount-codes/getDiscountCodes";
import updateDiscountCodesHandler from "../controllers/discount-codes/updateDiscountCodes";

//Define router
const router = Router();

//Fetch discount codes by event ID
//::Protected endpoint
router.get(
  "/get/:eventId",
  getDiscountCodesSchemaValidation,
  getDiscountCodesHandler
);

//Update discount codes by event ID
//::Protected endpoint
router.patch(
  "/update/:eventId",
  checkAuthStatus,
  updateDiscountCodesSchemaValidation,
  updateDiscountCodesHandler
);

export default router;
