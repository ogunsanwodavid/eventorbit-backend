import { Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import getSalesSummarySchemaValidation from "../utils/schema-validations/sales-analysis.ts/getSalesSummarySchemaValidation";
import getTicketsSalesSchemaValidation from "../utils/schema-validations/sales-analysis.ts/getTicketsSalesSummarySchemaValidation";

import getSalesSummaryHandler from "../controllers/sales-analysis/getSalesSummary";
import getTicketsSalesSummaryHandler from "../controllers/sales-analysis/getTicketsSalesSummary";

//Define router
const router = Router();

//Get sales summary for an event
//::Protected endpoint
router.get(
  "/get-sales-summary/:eventId",
  checkAuthStatus,
  getSalesSummarySchemaValidation,
  getSalesSummaryHandler
);

//Get tickets sale summary for an event
//::Protected endpoint
router.get(
  "/get-tickets-sales-summary/:eventId",
  checkAuthStatus,
  getTicketsSalesSchemaValidation,
  getTicketsSalesSummaryHandler
);

export default router;
