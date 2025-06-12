import cron from "node-cron";

import TicketExpirationService from "../../services/tickets/ticketExpiration.service";

const cronScheduleInterval = process.env.CRON_SCHEDULE_INTERVAL;

if (!cronScheduleInterval)
  throw new Error("Cron schedule interval missing in .env");

//Run the past tickets expiration cron job every schedule interval
const setupTicketExpirationJob = () => {
  cron.schedule(cronScheduleInterval, async () => {
    console.log("Running ticket expiration check...");
    await TicketExpirationService.expirePastTickets();
  });
};

export default setupTicketExpirationJob;
