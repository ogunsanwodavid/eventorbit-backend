import { Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import validateEvent from "../middleware/orders/validateEvent";
import calculateTotalPrice from "../middleware/orders/calculateTotalPrice";
import createNewOrder from "../middleware/orders/createNewOrder";
import validateCardPayment from "../middleware/orders/validateCardPayment";
import updateOrderStatus from "../middleware/orders/updateOrderStatus";
import resolveSoldStatus from "../middleware/orders/resolveSoldStatus";
import generateTickets from "../middleware/orders/generateTickets";

//Define router
const router = Router();

//Process order
//::Protected endpoint, only authorized users can pay for & get tickets
//::Check if event exists
//::Calculate price information for this order
//::Create a new order with "pending" status
//::Validate card payment credentials
//::Update order status after payment
//::Generate tickets and mail to user
//::Resolve sold status in tickets and schedules
router.post(
  "/process/:eventId",
  checkAuthStatus,
  validateEvent,
  calculateTotalPrice,
  createNewOrder,
  validateCardPayment,
  updateOrderStatus,
  generateTickets,
  resolveSoldStatus,
  (_, res: Response) => {
    res.status(201).json({
      message: "Order processed successfully",
    });
  }
);

export default router;
