import { Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { OrderModel } from "../../mongoose/models/order";

import { TicketModel } from "../../mongoose/models/ticket";

import { GetTicketTypeSummaryInput } from "../../utils/schema-validations/sales-analysis/getTicketTypeSummarySchemaValidation";

const getTicketTypeSummary = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event from request params
    const { eventId } = req.params as GetTicketTypeSummaryInput["params"];

    //Validate event ID format
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid event ID format",
      });
    }

    //Find event and verify ownership
    const event = await EventModel.findOne({
      _id: eventId,
      hostId: user._id,
    }).populate("tickets.types");

    if (!event) {
      return res.status(404).json({
        message: "Event not found or you don't have permission",
      });
    }

    //Get all tickets for the event grouped by name
    const tickets = await TicketModel.aggregate([
      { $match: { eventId: event._id } },
      {
        $group: {
          _id: "$name",
          count: { $sum: 1 },
          orders: { $addToSet: "$orderId" },
        },
      },
    ]);

    //Get order details for all unique order IDs
    const orderIds = tickets.flatMap((t) => t.orders);
    const orders = await OrderModel.find(
      { _id: { $in: orderIds } },
      { "payment.subtotal": 1 }
    ).lean();

    //Create a map of orderId to subtotal for quick lookup
    const orderSubtotals = new Map(
      orders.map((order) => [order._id.toString(), order.payment.subtotal])
    );

    //Prepare summary
    const summary = tickets.map((ticket) => {
      //Calculate net sales from all orders for this ticket type
      const netSales = ticket.orders.reduce((sum: number, orderId: string) => {
        return sum + (orderSubtotals.get(orderId.toString()) || 0);
      }, 0);

      //Find ticket type info from event
      const ticketType = event.tickets?.types?.find(
        (t: any) => t.name === ticket._id
      );

      return {
        ticketType: ticket._id,
        netSales,
        sold: ticket.count,
        available: ticketType?.quantity ?? "unlimited",
        price: ticketType?.price || ticketType?.minDonation || 0,
        currency: event.tickets?.currencies?.receive,
      };
    });

    res.status(200).json({
      message: "Ticket type summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch ticket type summary",
    });
  }
};

export default getTicketTypeSummary;
