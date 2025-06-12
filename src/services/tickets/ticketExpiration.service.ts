import { TicketModel } from "../../mongoose/models/ticket";

export default class TicketExpirationService {
  static async expirePastTickets() {
    try {
      const now = new Date();

      //Update tickets with past endDates from "reserved" to "attended"
      const result = await TicketModel.updateMany(
        {
          status: "reserved",
          endDate: { $lt: now },
        },
        {
          $set: { status: "attended" },
        }
      );

      console.log(
        `Updated ${result.modifiedCount} tickets to "attended" status`
      );

      return result.modifiedCount;
    } catch (error) {
      console.error("Error in ticket expiration job:", error);
      throw error;
    }
  }

  //Method to handle individual ticket expiration
  static async expireSingleTicket(ticketCode: string) {
    try {
      const ticket = await TicketModel.findOne({ code: ticketCode });
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      if (ticket.status === "reserved" && ticket.endDate < new Date()) {
        ticket.status = "attended";

        await ticket.save();
        return ticket;
      }

      return null;
    } catch (error) {
      console.error(`Error expiring ticket ${ticketCode}:`, error);
      throw error;
    }
  }
}
