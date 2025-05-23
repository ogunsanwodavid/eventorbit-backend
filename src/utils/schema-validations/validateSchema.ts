import { NextFunction, Request, Response } from "express";

import { ZodError, ZodType } from "zod";

const validateSchema =
  (schema: ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: err.errors,
        });
        return;
      }

      // Fallback in case of unexpected errors
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  };

export default validateSchema;
