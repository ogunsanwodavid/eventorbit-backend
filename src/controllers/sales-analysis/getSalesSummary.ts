import { Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { OrderModel } from "../../mongoose/models/order";

import { TicketModel } from "../../mongoose/models/ticket";

import { GetSalesSummaryInput } from "../../utils/schema-validations/sales-analysis/getSalesSummarySchemaValidation";

const getSalesSummary = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as GetSalesSummaryInput["params"];

    //Validate event ID format
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid event ID format",
      });
    }

    //Find event and verify ownership using hostId
    const event = await EventModel.findOne({
      _id: eventId,
      hostId: user._id,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have permission",
      });
    }

    //Get all orders for the event
    const orders = await OrderModel.find({ eventId }).lean();

    //Get all tickets for the event
    const tickets = await TicketModel.find({ eventId }).lean();

    //Calculate summary
    const summary = {
      netSales: orders
        .reduce((sum, order) => sum + (order.payment.subtotal || 0), 0)
        .toFixed(2),
      ordersCount: orders.length,
      attendeesCount: tickets.length,
      ticketSales: orders
        .reduce((sum, order) => sum + (order.payment.total || 0), 0)
        .toFixed(2),
      fees: orders
        .reduce((sum, order) => sum + (order.payment.fees || 0), 0)
        .toFixed(2),
      taxes: orders
        .reduce((sum, order) => sum + (order.payment.taxes || 0), 0)
        .toFixed(2),
      discounts: orders
        .reduce((sum, order) => sum + (order.payment.discount || 0), 0)
        .toFixed(2),
      appFees: orders
        .reduce((sum, order) => sum + (order.payment.appFees || 0), 0)
        .toFixed(2),
      currency: event.tickets?.currencies?.receive,
    };

    res.status(200).json({
      message: "Event summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sales summary",
    });
  }
};

export default getSalesSummary;
