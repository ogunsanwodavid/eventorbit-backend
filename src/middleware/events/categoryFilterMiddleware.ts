import { Request, Response, NextFunction } from "express";

import { FindEventsInput } from "../../utils/schema-validations/events/findEventsSchemaValidation";

const categoryFilterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get query parameters
  const queryParams = (req as any).query as FindEventsInput["query"];

  //Get category filter from request query
  const { category } = queryParams;

  //If category exists
  //;:Populate req search filters with category matches
  if (category) {
    req.searchFilters = {
      ...req.searchFilters,
      "basics.category": category,
    };
  }

  next();
};

export default categoryFilterMiddleware;
