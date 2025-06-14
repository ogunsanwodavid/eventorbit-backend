import { Response, Router } from "express";

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
import findEventsSchemaValidation from "../utils/schema-validations/events/findEventsSchemaValidation";
import updateEventStatusSchemaValidation from "../utils/schema-validations/events/updateEventStatusSchemaValidation";
import getEventTimeSlotsSchemaValidation from "../utils/schema-validations/events/getEventTimeSlotsSchemaValidation";
import getAttendeesSchemaValidation from "../utils/schema-validations/events/getAttendeesSchemaValidation";
import getOrdersSchemaValidation from "../utils/schema-validations/events/getOrdersSchemaValidation";
import getRandomEventsSchemaValidation from "../utils/schema-validations/events/getRandomEventsSchemaValidation";

import autoCreateDefaultCheckoutQuestions from "../middleware/events/autoCreateDefaultCheckoutQuestions";
import textSearchMiddleware from "../middleware/events/textSearchMiddleware";
import locationSearchMiddleware from "../middleware/events/locationSearchMiddleware";
import timeFrameFilterMiddleware from "../middleware/events/timeFrameFilterMiddleware";
import priceFilterMiddleware from "../middleware/events/priceFilterMiddleware";
import categoryFilterMiddleware from "../middleware/events/categoryFilterMiddleware";
import sendCreatedEventEmail from "../middleware/events/sendCreatedEventEmail";

import createEventHandler from "../controllers/events/createEvent";
import getEventByAliasHandler from "../controllers/events/getEventByAlias";
import getMyEventsHandler from "../controllers/events/getMyEvents";
import updateEventBasicsHandler from "../controllers/events/updateEventBasics";
import updateEventDurationHandler from "../controllers/events/updateEventDuration";
import updateEventSchedulesHandler from "../controllers/events/updateEventSchedules";
import updateEventTicketsHandler from "../controllers/events/updateEventTickets";
import updateEventAdditionalDetailsHandler from "../controllers/events/updateEventAdditionalDetails";
import deleteEventHandler from "../controllers/events/deleteEvent";
import findEventsHandler from "../controllers/events/findEvents";
import updateEventStatusHandler from "../controllers/events/updateEventStatus";
import getEventTimeSlotsHandler from "../controllers/events/getEventTimeSlots";
import getAttendeesHandler from "../controllers/events/getAttendees";
import getOrdersHandler from "../controllers/events/getOrders";
import getRandomEventsHandler from "../controllers/events/getRandomEvents";

//Define router
const router = Router();

//Find events
//::Filter by =>
/**
 * text search string
 * location
 * event category
 * time frame of event
 * price of tickets
 */
router.get(
  "/find",
  findEventsSchemaValidation,
  textSearchMiddleware,
  locationSearchMiddleware,
  categoryFilterMiddleware,
  timeFrameFilterMiddleware,
  priceFilterMiddleware,
  findEventsHandler
);

//Create a new event
//::Protected endpoint
//::Create default checkout questions
//::Send email to user
router.post(
  "/create",
  checkAuthStatus,
  createEventSchemaValidation,
  createEventHandler,
  sendCreatedEventEmail,
  autoCreateDefaultCheckoutQuestions,
  (_, res: Response) => {
    res.status(201).json({
      message: "Event created successfully",
    });
  }
);

//Get an event by its alias
router.get(
  "/get-by-alias/:alias",
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

//Get a fixed number of random events
router.get(
  "/get-random-events",
  checkAuthStatus,
  getRandomEventsSchemaValidation,
  getRandomEventsHandler
);

//Get all timeslots for a timed-entry event
//::Protected endpoint
router.get(
  "/get-timeslots/:eventId",
  checkAuthStatus,
  getEventTimeSlotsSchemaValidation,
  getEventTimeSlotsHandler
);

//Get all orders placed for an event
//::Protected endpoint
router.get(
  "/get-orders/:eventId",
  checkAuthStatus,
  getOrdersSchemaValidation,
  getOrdersHandler
);

//Get attendees for an event
//::Protected endpoint
router.get(
  "/get-attendees/:eventId",
  checkAuthStatus,
  getAttendeesSchemaValidation,
  getAttendeesHandler
);

//Update event status
router.patch(
  "/update-status/:eventId",
  checkAuthStatus,
  updateEventStatusSchemaValidation,
  updateEventStatusHandler
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
