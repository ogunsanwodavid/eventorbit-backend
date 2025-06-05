import { Request, Response, NextFunction } from "express";

import moment from "moment-timezone";

const timeFrameFilterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Get timeFrame query string from request query
  //::Return if not string or undefined
  const { timeFrame } = req.query;

  if (!timeFrame || typeof timeFrame !== "string") {
    return next();
  }

  try {
    //Use moment to get the day date info
    const now = moment().startOf("day");

    //Initialize startDate and endDate as Moment's
    let startDate: moment.Moment, endDate: moment.Moment;

    switch (timeFrame) {
      case "today":
        startDate = now.clone();
        endDate = now.clone().endOf("day");
        break;
      case "this-week":
        startDate = now.clone().startOf("week");
        endDate = now.clone().endOf("week");
        break;
      case "this-weekend":
        startDate = now.clone().day(6).startOf("day"); //Saturday
        endDate = now.clone().day(7).endOf("day"); //Sunday
        break;
      case "next-week":
        startDate = now.clone().add(1, "week").startOf("week");
        endDate = now.clone().add(1, "week").endOf("week");
        break;
      default:
        return next();
    }

    //Convert ITime to JS Date variables
    const startDateJS = startDate.toDate();
    const endDateJS = endDate.toDate();

    //Initialize search filters if they don't exist
    req.searchFilters = req.searchFilters || {};
    req.searchFilters.$or = req.searchFilters.$or || [];

    //For regular events (using startDate/endDate)
    req.searchFilters.$or.push({
      type: "regular",
      $and: [
        { "duration.startDate": { $lte: endDateJS } },
        { "duration.endDate": { $gte: startDateJS } },
      ],
    });

    //For timed-entry events (using schedules with timeSlots)
    req.searchFilters.$or.push({
      type: "timed-entry",
      schedules: {
        $elemMatch: {
          startDate: { $lte: endDateJS },
          $or: [
            { endDate: { $gte: startDateJS } },
            { endDate: { $exists: false } },
          ],
          timeSlots: {
            $elemMatch: {
              $or: [
                //Slot starts within time frame
                {
                  $and: [
                    { "startTime.hours": { $gte: startDate.hours() } },
                    { "startTime.hours": { $lte: endDate.hours() } },
                  ],
                },
                //Slot ends within time frame
                {
                  $and: [
                    { "endTime.hours": { $gte: startDate.hours() } },
                    { "endTime.hours": { $lte: endDate.hours() } },
                  ],
                },
                //Slot spans time frame
                {
                  $and: [
                    { "startTime.hours": { $lte: startDate.hours() } },
                    { "endTime.hours": { $gte: endDate.hours() } },
                  ],
                },
              ],
            },
          },
        },
      },
    });

    next();
  } catch (error) {
    console.error("Time frame filter error:", error);
    next(error);
  }
};

export default timeFrameFilterMiddleware;
