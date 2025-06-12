import { Request, Response, NextFunction } from "express";

import { FindEventsInput } from "../../utils/schema-validations/events/findEventsSchemaValidation";

const locationSearchMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get query parameters
  const queryParams = (req as any).query as FindEventsInput["query"];

  //Get location from request query
  const { location } = queryParams;

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
