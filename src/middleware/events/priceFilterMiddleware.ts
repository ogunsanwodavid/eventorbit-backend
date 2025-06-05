import { Request, Response, NextFunction } from "express";

const priceFilterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get price filter from request query
  const { price } = req.query;

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
