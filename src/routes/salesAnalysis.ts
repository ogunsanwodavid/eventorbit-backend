import { Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import getSalesSummarySchemaValidation from "../utils/schema-validations/sales-analysis/getSalesSummarySchemaValidation";
import getTicketsSalesSchemaValidation from "../utils/schema-validations/sales-analysis/getTicketsSalesSummarySchemaValidation";
import getTicketTypeSummarySchemaValidation from "../utils/schema-validations/sales-analysis/getTicketTypeSummarySchemaValidation";

import getSalesSummaryHandler from "../controllers/sales-analysis/getSalesSummary";
import getTicketsSalesSummaryHandler from "../controllers/sales-analysis/getTicketsSalesSummary";
import getTicketTypeSummaryHandler from "../controllers/sales-analysis/getTicketTypeSummary";

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

//Get ticket type summary for an event
//::Protected endpoint
router.get(
  "/get-ticket-type-summary/:eventId",
  checkAuthStatus,
  getTicketTypeSummarySchemaValidation,
  getTicketTypeSummaryHandler
);

export default router;
