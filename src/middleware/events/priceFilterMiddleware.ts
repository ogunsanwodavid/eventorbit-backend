import { Request, Response, NextFunction } from "express";

import { FindEventsInput } from "../../utils/schema-validations/events/findEventsSchemaValidation";

const priceFilterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get query parameters
  const queryParams = (req as any).query as FindEventsInput["query"];

  //Get price filter from request query
  const { price } = queryParams;

  //If price is free
  //::Populate search filters with free events
  if (price === "free") {
    req.searchFilters = {
      ...req.searchFilters,
      "tickets.types": {
        $elemMatch: {
          type: "Free",
        },
      },
    };
  }

  next();
};

export default priceFilterMiddleware;
