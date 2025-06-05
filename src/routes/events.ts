import { Request, Response, Router } from "express";

import checkAuthStatus from "../middleware/auth/checkAuthStatus";

import createEventSchemaValidation from "../utils/schema-validations/events/createEventSchemaValidation";
import getEventByAliasSchemaValidation from "../utils/schema-validations/events/getEventByAliasSchemaValidation";
import getMyEventsSchemaValidation from "../utils/schema-validations/events/getMyEventsSchemaValidation";
import updateEventBasicsSchemaValidation from "../utils/schema-validations/events/updateEventBasicsSchemaValidation";
import updateEventDurationSchemaValidation from "../utils/schema-validations/events/updateEventDurationSchemaValidation";
import updateEventSchedulesSchemaValidation from "../utils/schema-validations/events/updateEventSchedulesSchemaValidation";
import updateEventTicketsSchemaValidation from "../utils/schema-validations/events/updateEventTicketsSchemaValidation";
import updateEventAdditionalDetailsSchemaValidation from "../utils/schema-validations/events/updateEventAdditionalDetailsSchemaValidation";
import deleteEventSchemaValidation from "../utils/schema-validations/events/deleteEventSchemaValidation";
import searchEventsSchemaValidation from "../utils/schema-validations/events/searchEventsSchemaValidation";

import textSearchMiddleware from "../middleware/events/textSearchMiddleware";
import locationSearchMiddleware from "../middleware/events/locationSearchMiddleware";
import timeFrameFilterMiddleware from "../middleware/events/timeFrameFilterMiddleware";
import priceFilterMiddleware from "../middleware/events/priceFilterMiddleware";
import categoryFilterMiddleware from "../middleware/events/categoryFilterMiddleware";

import createEventHandler from "../controllers/events/createEvent";
import getEventByAliasHandler from "../controllers/events/getEventByAlias";
import getMyEventsHandler from "../controllers/events/getMyEvents";
import updateEventBasicsHandler from "../controllers/events/updateEventBasics";
import updateEventDurationHandler from "../controllers/events/updateEventDuration";
import updateEventSchedulesHandler from "../controllers/events/updateEventSchedules";
import updateEventTicketsHandler from "../controllers/events/updateEventTickets";
import updateEventAdditionalDetailsHandler from "../controllers/events/updateEventAdditionalDetails";
import deleteEventHandler from "../controllers/events/deleteEvent";
import searchEventsHandler from "../controllers/events/searchEvents";

//Define router
const router = Router();

//Search for events
//::Filter by =>
/**
 * text search string
 * location
 * event category
 * time frame of event
 * price of tickets
 */
router.get(
  "/search",
  searchEventsSchemaValidation,
  textSearchMiddleware,
  locationSearchMiddleware,
  categoryFilterMiddleware,
  timeFrameFilterMiddleware,
  priceFilterMiddleware,
  searchEventsHandler
);

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
router.get(
  "/get-by-alias/:alias",
  //checkAuthStatus,
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
router.patch(
  "/update-additional-details/:eventId",
  checkAuthStatus,
  updateEventAdditionalDetailsSchemaValidation,
  updateEventAdditionalDetailsHandler
);

//Delete event by id
//::Protected endpoint
router.get(
  "/delete/:eventId",
  checkAuthStatus,
  deleteEventSchemaValidation,
  deleteEventHandler
);

export default router;
