import { Request, Response, NextFunction } from "express";

const categoryFilterMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get category filter from request query
  const { category } = req.query;

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
