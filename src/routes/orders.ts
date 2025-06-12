import { Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import validateEvent from "../middleware/orders/validateEvent";
import calculateTotalPrice from "../middleware/orders/calculateTotalPrice";
import createNewOrder from "../middleware/orders/createNewOrder";
import validateCardPayment from "../middleware/orders/validateCardPayment";
import updateOrderStatus from "../middleware/orders/updateOrderStatus";
import resolveSoldStatus from "../middleware/orders/resolveSoldStatus";
import createTickets from "../middleware/orders/createTickets";
import formatTickets from "../middleware/orders/formatTickets";
import generateTicketPdfs from "../middleware/orders/generateTicketPdfs";
import mailTickets from "../middleware/orders/mailTickets";

import processOrderSchemaValidation from "../utils/schema-validations/orders/processOrderSchemaValidation";
import getOrdersSchemaValidation from "../utils/schema-validations/orders/getOrdersSchemaValidation";

import getOrders from "../controllers/orders/getOrders";

//Define router
const router = Router();

//Process order
//::Protected endpoint, only authorized users can pay for & get tickets
//::Validate request with zod schema
//::Check if event exists
//::Calculate price information for this order
//::Create a new order with "pending" status
//::Validate card payment credentials
//::Update order status after payment
//::Create tickets in database
//::Resolve sold status in tickets and schedules
//::Format tickets to be parse-able into PDFs
//::Generate tickets as pdfs and merge into one
//::Mail tickets to buyer
router.post(
  "/process/:eventId",
  checkAuthStatus,
  processOrderSchemaValidation,
  validateEvent,
  calculateTotalPrice,
  createNewOrder,
  validateCardPayment,
  updateOrderStatus,
  createTickets,
  resolveSoldStatus,
  formatTickets,
  generateTicketPdfs,
  mailTickets,
  (_, res: Response) => {
    res.status(201).json({
      message: "Order processed successfully",
    });
  }
);

//Get all orders placed for an event
//::Protected endpoint
router.get(
  "/get-orders/:eventId",
  checkAuthStatus,
  getOrdersSchemaValidation,
  getOrders
);

export default router;
