import { Request, Response } from "express";

import { IUser } from "../../mongoose/models/user";

import { EventModel } from "../../mongoose/models/event";

const getMyEvents = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //User id
    const userId = user._id as String;

    //Get req query parameters
    //::Pagination info
    const { page, limit, status, search, sort } = req.query as any;

    //Base query
    const query = { hostId: userId } as any;

    //Status filter
    if (status) query.status = status;

    //Search functionality (case-insensitive)
    //::Check search matches in name, alias and description
    if (search) {
      query.$or = [
        { "basics.name": { $regex: search, $options: "i" } },
        { "basics.description": { $regex: search, $options: "i" } },
      ];
    }

    //Sorting
    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "name-asc": { "basics.name": 1 },
      "name-desc": { "basics.name": -1 },
    };

    const [events, total] = await Promise.all([
      EventModel.find(query)
        .populate({
          path: "hostId",
          select: "name avatar",
        })
        .populate({
          path: "tickets.types",
          select: "type name price",
        })
        .select("-__v -updatedAt")
        .sort(sortOptions[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      EventModel.countDocuments(query),
    ]);

    res.status(200).json({
      message: "Your events fetched successfully",
      data: events,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch your events",
    });
  }
};

export default getMyEvents;
