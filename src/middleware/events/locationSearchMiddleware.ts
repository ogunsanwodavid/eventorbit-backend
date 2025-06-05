import { Request, Response, NextFunction } from "express";

const locationSearchMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get location from request query
  const { location } = req.query;

  //If location filter exists
  //::Check address , venue and connection details for match
  //::Populate req search filters with result
  if (location) {
    req.searchFilters = {
      ...req.searchFilters,
      $or: [
        { "basics.location.address": { $regex: location, $options: "i" } },
        { "basics.location.venueName": { $regex: location, $options: "i" } },
        {
          "basics.location.organizerAddress": {
            $regex: location,
            $options: "i",
          },
        },
        {
          "basics.location.connectionDetails": {
            $regex: location,
            $options: "i",
          },
        },
      ],
    };
  }

  next();
};

export default locationSearchMiddleware;
