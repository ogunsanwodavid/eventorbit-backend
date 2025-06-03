import { Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import createEventSchemaValidation from "../utils/schema-validations/events/createEventSchemaValidation";
import getEventByAliasSchemaValidation from "../utils/schema-validations/events/getEventByAliasSchemaValidation";
import getMyEventsSchemaValidation from "../utils/schema-validations/events/getMyEventsSchemaValidation";
import updateEventBasicsSchemaValidation from "../utils/schema-validations/events/updateEventBasicsSchemaValidation";
import updateEventDurationSchemaValidation from "../utils/schema-validations/events/updateEventDurationSchemaValidation";
import updateEventSchedulesSchemaValidation from "../utils/schema-validations/events/updateEventSchedulesSchemaValidation";
import updateEventTicketsSchemaValidation from "../utils/schema-validations/events/updateEventTicketsSchemaValidation";

import createEventHandler from "../controllers/events/createEvent";
import getEventByAliasHandler from "../controllers/events/getEventByAlias";
import getMyEventsHandler from "../controllers/events/getMyEvents";
import updateEventBasicsHandler from "../controllers/events/updateEventBasics";
import updateEventDurationHandler from "../controllers/events/updateEventDuration";
import updateEventSchedulesHandler from "../controllers/events/updateEventSchedules";
import updateEventTicketsHandler from "../controllers/events/updateEventTickets";

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

//Update event basics
//::Protected endpoint
router.patch(
  "/update-basics/:eventId",
  checkAuthStatus,
  updateEventBasicsSchemaValidation,
  updateEventBasicsHandler
);

//Update event duration (start and end time)
//::For regular events
//::Protected endpoint
router.patch(
  "/update-duration/:eventId",
  checkAuthStatus,
  updateEventDurationSchemaValidation,
  updateEventDurationHandler
);

//Update event schedules
//::For timed-entry events
//::Protected endpoint
router.patch(
  "/update-schedules/:eventId",
  checkAuthStatus,
  updateEventSchedulesSchemaValidation,
  updateEventSchedulesHandler
);

//Update tickets info
//::Protected endpoint
router.patch(
  "/update-tickets/:eventId",
  checkAuthStatus,
  updateEventTicketsSchemaValidation,
  updateEventTicketsHandler
);

//Update additional details
//::Protected endpoint
router.patch("/update-additional-details/:eventId", checkAuthStatus);

export default router;
