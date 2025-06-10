import { Request, Response, NextFunction } from "express";

import { DiscountCodesModel } from "../../mongoose/models/discountCodes";

import { IEvent } from "../../mongoose/models/event";

import { ProcessOrderInput } from "../../utils/schema-validations/orders/processOrderSchemaValidation";

export interface PriceCalculation {
  subtotal: number;
  taxes: number;
  discount: number;
  appFees: number;
  total: number;
  currency: string;
}

const calculateTotalPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get event object from request
    const event = (req as any).event as IEvent;

    //Get tickets info and discountCode  from request body
    const { tickets, discountCode } = req.body as ProcessOrderInput["body"];

    //Get event currency for receiving funds
    const currency = event.tickets.currencies.receive;

    //Calculate subtotal from tickets
    let subtotal = tickets.reduce((sum: number, ticket: any) => {
      return sum + (ticket.price || 0) * ticket.quantityPurchased;
    }, 0);

    //Apply discount if code provided and is active
    let discount = 0;
    if (discountCode) {
      const discountDoc = await DiscountCodesModel.findOne({
        eventId: event._id,
        "codes.code": discountCode,
        "codes.isActive": true,
      });

      if (discountDoc) {
        const discountCodeData = discountDoc.codes.find(
          (c) => c.code === discountCode
        );
        if (discountCodeData) {
          if (
            discountCodeData.uses.maxUse &&
            discountCodeData.uses.totalUse >= discountCodeData.uses.maxUse
          ) {
            return res
              .status(400)
              .json({ message: "Discount code usage limit reached" });
          }

          if (discountCodeData.amount.unit === "percentage") {
            discount = subtotal * (discountCodeData.amount.value / 100);
          } else {
            discount = Math.min(discountCodeData.amount.value, subtotal);
          }
        }
      }
    }

    //Calculate other amounts
    const taxes = subtotal * 0.05; // 5% tax
    const appFees = subtotal * 0.03; // 3% app fee
    const total = subtotal + taxes + appFees - discount;

    //Attach to request
    (req as any).priceCalculation = {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxes: parseFloat(taxes.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      appFees: parseFloat(appFees.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      currency,
    } as PriceCalculation;

    next();
  } catch (error) {
    next(error);
  }
};

export default calculateTotalPrice;
