import { Request, Response, NextFunction } from "express";

import { Profile } from "../../mongoose/models/profile";

const textSearchMiddleware = async (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => {
  //Get text search term from request query
  const { searchTerm } = req.query;

  if (!searchTerm || typeof searchTerm !== "string") {
    return next();
  }

  try {
    //Initialize searchFilters if it doesn't exist
    if (!req.searchFilters) {
      req.searchFilters = {};
    }

    //Create base conditions for event name/description
    let eventConditions = [
      { "basics.name": { $regex: searchTerm, $options: "i" } },
      { "basics.description": { $regex: searchTerm, $options: "i" } },
    ] as any;

    //Find matching profiles and get their userIds (which match event hostIds)
    const profiles = await Profile.find({
      $or: [
        { "info.firstName": { $regex: searchTerm, $options: "i" } },
        { "info.lastName": { $regex: searchTerm, $options: "i" } },
        { "info.organizationName": { $regex: searchTerm, $options: "i" } },
      ],
    }).select("userId"); //Get userId which matches event's hostId

    //Add hostId condition only if we found matching profiles
    if (profiles.length > 0) {
      const hostIds = profiles.map((p) => p.userId);
      eventConditions.push({ hostId: { $in: hostIds } });
    }

    //Combine with existing $or conditions if they exist
    if (req.searchFilters?.$or) {
      req.searchFilters.$or = [...req.searchFilters?.$or, ...eventConditions];
    } else {
      req.searchFilters.$or = eventConditions;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default textSearchMiddleware;
