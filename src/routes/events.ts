import { Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import createEventSchemaValidation from "../utils/schema-validations/events/createEventSchemaValidation";
import getEventByAliasSchemaValidation from "../utils/schema-validations/events/getEventByAliasSchemaValidation";
import getMyEventsSchemaValidation from "../utils/schema-validations/events/getMyEventsSchemaValidation";

import createEventHandler from "../controllers/events/createEvent";
import getEventByAliasHandler from "../controllers/events/getEventByAlias";
import getMyEventsHandler from "../controllers/events/getMyEvents";

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

//Get an event by its alias
//::Protected endpoint
router.get(
  "/get-by-alias/:alias",
  checkAuthStatus,
  getEventByAliasSchemaValidation,
  getEventByAliasHandler
);

//Get all events created by user
//::Protected endpoint
router.get(
  "/get-my-events",
  checkAuthStatus,
  getMyEventsSchemaValidation,
  getMyEventsHandler
);

export default router;
