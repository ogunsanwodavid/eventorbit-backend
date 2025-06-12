import { Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import getMyTicketsSchemaValidation from "../utils/schema-validations/tickets/getMyTicketsSchemaValidation";
import validateTicketSchemaValidation from "../utils/schema-validations/tickets/validateTicketSchemaValidation";
import downloadTicketPdfSchemaValidation from "../utils/schema-validations/tickets/downloadTicketPdfSchemaValidation";

import getMyTicketsHandler from "../controllers/tickets/getMyTickets";
import validateTicketHandler from "../controllers/tickets/validateTicket";
import downloadTicketPdfHandler from "../controllers/tickets/downloadTicketPdf";

//Define router
const router = Router();

//Get all tickets owned by user
//::Protected endpoint
router.get(
  "/get-my-tickets",
  checkAuthStatus,
  getMyTicketsSchemaValidation,
  getMyTicketsHandler
);

//Check ticket validation status
router.get(
  "/validate/:ticketCode",
  validateTicketSchemaValidation,
  validateTicketHandler
);

//Download ticket pdf
router.get(
  "/download-pdf/:ticketCode",
  downloadTicketPdfSchemaValidation,
  downloadTicketPdfHandler
);

export default router;
