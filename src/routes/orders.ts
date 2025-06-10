import { Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import validateEvent from "../middleware/orders/validateEvent";
import calculateTotalPrice from "../middleware/orders/calculateTotalPrice";
import createNewOrder from "../middleware/orders/createNewOrder";
import validateCardPayment from "../middleware/orders/validateCardPayment";
import updateOrderStatus from "../middleware/orders/updateOrderStatus";
import resolveSoldStatus from "../middleware/orders/resolveSoldStatus";

//Define router
const router = Router();

//Process order
//::Protected ednpoint, only authorized users can pay for & get tickets
router.post(
  "/process/:eventId",
  checkAuthStatus,
  validateEvent,
  calculateTotalPrice,
  createNewOrder,
  validateCardPayment,
  updateOrderStatus,
  resolveSoldStatus
);

export default router;
