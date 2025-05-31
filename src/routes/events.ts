import { Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import createEventSchemaValidation from "../utils/schema-validations/events/createEventSchemaValidation";

import createEventHandler from "../controllers/events/createEvent";

//Define router
const router = Router();

//Create a new event
//::Protected endpoint
router.post(
  "/create",
  checkAuthStatus,
  createEventSchemaValidation,
  createEventHandler,
  (req: Request, res: Response) => {
    res.status(201).json({
      message: "Event created successfully",
    });
  }
);

export default router;
