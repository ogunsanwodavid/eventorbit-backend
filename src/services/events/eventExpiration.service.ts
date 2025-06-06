import { EventModel } from "../../mongoose/models/event";

export default class EventExpirationService {
  static async expirePastEvents() {
    try {
      //Process regular events
      await this.expireRegularEvents();

      //Process timed-entry events
      await this.expireTimedEntryEvents();

      console.log("Event expiration check completed");
    } catch (error) {
      console.error("Error in event expiration job:", error);
    }
  }

  private static async expireRegularEvents(): Promise<number> {
    const now = new Date();

    //Expire past events
    const expireResult = await EventModel.updateMany(
      {
        type: "regular",
        status: "live",
        "duration.endDate": { $lt: now },
      },
      {
        $set: { status: "expired" },
      }
    );

    //Draft events that are expired but now have future endDates
    const draftResult = await EventModel.updateMany(
      {
        type: "regular",
        status: "expired",
        "duration.endDate": { $gte: now },
      },
      {
        $set: { status: "drafted" },
      }
    );

    console.log(
      `Expired ${expireResult.modifiedCount} events, drafted ${draftResult.modifiedCount} events`
    );
    return expireResult.modifiedCount + draftResult.modifiedCount;
  }

  private static async expireTimedEntryEvents(): Promise<any> {
    const now = new Date();
    let expiredCount = 0;
    let draftedCount = 0;

    //Process all timed-entry events
    const timedEvents = await EventModel.find({
      type: "timed-entry",
      $or: [
        { status: "live" }, //Check live events for expiration
        { status: "expired" }, //Check expired events for re-drafting
      ],
    });

    for (const event of timedEvents) {
      let latestEndDate: Date | null = null;

      if (!event.schedules || event.schedules.length === 0) return;

      //Find the latest endDate across all schedules
      for (const schedule of event.schedules) {
        if (
          schedule.endDate &&
          (!latestEndDate || schedule.endDate > latestEndDate)
        ) {
          latestEndDate = schedule.endDate;
        }
      }

      //If no endDate in any schedule, skip this event
      if (!latestEndDate) continue;

      if (latestEndDate < now) {
        //Expire live events with past endDates
        if (event.status === "live") {
          await EventModel.updateOne(
            { _id: event._id },
            { $set: { status: "expired" } }
          );
          expiredCount++;
        }
      } else {
        //Re-draft expired events with future endDates
        if (event.status === "expired") {
          await EventModel.updateOne(
            { _id: event._id },
            { $set: { status: "drafted" } }
          );
          draftedCount++;
        }
      }
    }

    console.log(
      `Expired ${expiredCount} timed-entry events, drafted ${draftedCount} events`
    );
    return expiredCount + draftedCount;
  }
}
