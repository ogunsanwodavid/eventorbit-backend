import { Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import getCheckoutQuestionsSchemaValidation from "../utils/schema-validations/checkout-questions/getCheckoutQuestionsSchemaValidation";
import updateCheckoutQuestionsSchemaValidation from "../utils/schema-validations/checkout-questions/updateCheckoutQuestionsSchemaValidation";

import getCheckoutQuestionsHandler from "../controllers/checkout-questions/getCheckoutQuestions";
import updateCheckoutQuestionsHandler from "../controllers/checkout-questions/updateCheckoutQuestions";

//Define router
const router = Router();

//Fetch checkout questions by event ID
//::Protected endpoint
router.get(
  "/get/:eventId",
  checkAuthStatus,
  getCheckoutQuestionsSchemaValidation,
  getCheckoutQuestionsHandler
);

//Update checkout questions by event ID
//::Protected endpoint
router.patch(
  "/update/:eventId",
  checkAuthStatus,
  updateCheckoutQuestionsSchemaValidation,
  updateCheckoutQuestionsHandler
);

export default router;
