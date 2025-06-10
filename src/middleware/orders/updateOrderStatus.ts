import { Request, Response, NextFunction } from "express";

import { IOrder } from "../../mongoose/models/order";

import { PaymentResult } from "./validateCardPayment";

const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get new order from request
    const newOrder = (req as any).newOrder as IOrder;

    //Get paymentResult from request
    const paymentResult = (req as any).paymentResult as PaymentResult;

    //Update status depending on payment result and save
    newOrder.status = paymentResult.success ? "paid" : "failed";
    await newOrder.save();

    //Throw error if payment failed
    if (!paymentResult.success) {
      throw new Error("Payment failed");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default updateOrderStatus;
