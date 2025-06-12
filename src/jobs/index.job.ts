import setupEventExpirationJob from "./events/eventExpiration.job";

import setupTicketExpirationJob from "./tickets/ticketExpiration.job";

export const runAllCronJobs = () => {
  //Event expiration cron job
  setupEventExpirationJob();

  //Ticket expiration cron job
  setupTicketExpirationJob();
};
