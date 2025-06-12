import { Request, Response } from "express";

import { isValidObjectId } from "mongoose";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

import { OrderModel } from "../../mongoose/models/order";

import { GetOrdersInput } from "../../utils/schema-validations/events/getOrdersSchemaValidation";

const getOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event's id from request params
    const { eventId } = req.params as GetOrdersInput["params"];

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

    //Get query parameters from query
    const queryParams = (req as any).query as GetOrdersInput["query"];

    //Pagination info
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 20;
    const skip = (page - 1) * limit;

    //Filters
    const status = queryParams?.status;
    const search = queryParams?.search;
    const sort = queryParams?.sort || "desc";

    //Build DB query filters
    const filter: any = { eventId };

    //Handle status filter
    if (status) {
      filter.status = status;
    }

    //Handle search filter
    //Search in buyer's name and email
    if (search) {
      filter.$or = [
        { "buyer.name": { $regex: search, $options: "i" } },
        { "buyer.email": { $regex: search, $options: "i" } },
      ];
    }

    //Handle sort filter
    const sortOptions: any = {
      dateOrdering: sort === "asc" ? 1 : -1,
    };

    //Get orders with pagination
    const [orders, total] = await Promise.all([
      OrderModel.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      OrderModel.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Orders fetched successfully",
      data: {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch orders",
    });
  }
};

export default getOrders;
