import cron from "node-cron";

import EventExpirationService from "../../services/events/eventExpiration.service";

const cronScheduleInterval = process.env.CRON_SCHEDULE_INTERVAL;

if (!cronScheduleInterval)
  throw new Error("Cron schedule interval missing in .env");

//Run the past events expiration cron job every schedule interval
const setupEventExpirationJob = () => {
  cron.schedule(cronScheduleInterval, async () => {
    console.log("Running event expiration check...");
    await EventExpirationService.expirePastEvents();
  });
};

export default setupEventExpirationJob;
