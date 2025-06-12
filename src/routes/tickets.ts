import { Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import getMyTicketsHandler from "../controllers/tickets/getMyTickets";

//Define router
const router = Router();

//Get all tickets owned by user
//::Protected endpoint
router.get("/get-my-tickets", checkAuthStatus, getMyTicketsHandler);

export default router;
