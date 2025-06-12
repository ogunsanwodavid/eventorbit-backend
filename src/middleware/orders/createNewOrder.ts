import { Request, Response, NextFunction } from "express";

import { IUser } from "../../mongoose/models/user";

import { IEvent } from "../../mongoose/models/event";

import { OrderModel } from "../../mongoose/models/order";

import { ProcessOrderInput } from "../../utils/schema-validations/orders/processOrderSchemaValidation";

import { PriceCalculation } from "./calculateTotalPrice";

const createNewOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event object from request
    const event = (req as any).event as IEvent;

    //Get duration and tickets from request body
    const { duration, tickets, order } = req.body as ProcessOrderInput["body"];

    //Get price calculation
    const priceCalculation = (req as any).priceCalculation as PriceCalculation;

    //Create new order
    const newOrder = new OrderModel({
      eventId: event._id,
      buyerId: user._id,
      status: "pending",
      dateOrdering: new Date(),
      dateAttending: duration.startDate,
      itemsQuantity: tickets.reduce((sum, t) => sum + t.quantityPurchased, 0),
      payment: priceCalculation,
      checkoutResponses: order.checkoutResponses,
      buyer: {
        name:
          user.userType === "individual"
            ? `${user.firstName} ${user.lastName}`
            : `${user.organizationName}`,
        email: user.email,
      },
    });

    //Attach new order to request
    (req as any).newOrder = newOrder;

    next();
  } catch (error) {
    next(error);
  }
};

export default createNewOrder;
