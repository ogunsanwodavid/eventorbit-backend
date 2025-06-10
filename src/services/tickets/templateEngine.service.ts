import fs from "fs";

import handlebars from "handlebars";

import { FormattedTicket } from "../../middleware/orders/formatTickets";

export function compileTicketTemplate(formattedTicket: FormattedTicket) {
  const template = fs.readFileSync(
    "../../templates/tickets/ticket.hbs",
    "utf8"
  );

  return handlebars.compile(template)(formattedTicket);
}
