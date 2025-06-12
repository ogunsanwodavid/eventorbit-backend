import { Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import getMyTicketsSchemaValidation from "../utils/schema-validations/tickets/getMyTicketsSchemaValidation";
import validateTicketSchemaValidation from "../utils/schema-validations/tickets/validateTicketSchemaValidation";

import getMyTicketsHandler from "../controllers/tickets/getMyTickets";
import validateTicketHandler from "../controllers/tickets/validateTicket";

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

export default router;
