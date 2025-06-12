import { Request, Response } from "express";

import { TicketModel } from "../../mongoose/models/ticket";

import { ValidateTicketInput } from "../../utils/schema-validations/tickets/validateTicketSchemaValidation";

const validateTicket = async (req: Request, res: Response): Promise<any> => {
  try {
    //Get ticket code from request params
    const { ticketCode } = req.params as ValidateTicketInput["params"];

    //Find ticket by code
    const ticket = await TicketModel.findOne({ code: ticketCode }).exec();

    //Check ticket exists
    if (!ticket) {
      return res.status(404).json({
        valid: false,
        message: "Ticket not found",
      });
    }

    //Check if ticket is reserved
    if (ticket.status !== "reserved") {
      return res.status(400).json({
        valid: false,
        message: "Ticket is not valid for entry",
        currentStatus: ticket.status,
      });
    }

    //Check if ticket is upcoming and not expired
    const now = new Date();

    if (ticket.endDate < now) {
      return res.status(400).json({
        valid: false,
        message: "Ticket has expired",
      });
    }

    //If all checks pass
    res.status(200).json({
      valid: true,
      message: "Ticket is valid",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      valid: false,
      message: "Failed to validate ticket",
    });
  }
};

export default validateTicket;
