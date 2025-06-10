import { Request, Response, NextFunction } from "express";

import { IUser, User } from "../../mongoose/models/user";

import { IEvent } from "../../mongoose/models/event";

import { IOrder } from "../../mongoose/models/order";

import { TicketModel } from "../../mongoose/models/ticket";

import { ProcessOrderInput } from "../../utils/schema-validations/orders/processOrderSchemaValidation";

import generateUniqueTicketCode from "../../utils/helpers/orders/generateUniqueTicketCode";
import generateQRCodeForTicket from "../../utils/helpers/orders/generateQRCodeForTicket";
import calculateTicketValue from "../../utils/helpers/orders/calculateTicketValue";
import { Profile } from "../../mongoose/models/profile";

const generateTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get user from request
    const user = (req as any)["user"] as IUser;

    //Get event from request
    const event = (req as any)["event"] as IEvent;

    //Get new order from request
    const newOrder = (req as any).newOrder as IOrder;

    //Get tickets info duration from request body
    const { tickets, duration } = req.body as ProcessOrderInput["body"];

    //Get event's host profile object
    const hostProfile = await Profile.findOne({
      userId: event.hostId,
    });

    if (!hostProfile) {
      return res.status(404).json({
        message: "Host profile not found",
      });
    }

    //Generate tickets sequentially with quantity support
    for (const ticketData of tickets) {
      //Validate quantity
      if (!ticketData.quantityPurchased || ticketData.quantityPurchased < 1) {
        throw new Error(`Invalid quantity for ticket ${ticketData._id}`);
      }

      //Generate multiple tickets based on quantity
      for (let i = 0; i < ticketData.quantityPurchased; i++) {
        //Generate unique code for each ticket instance
        const code = await generateUniqueTicketCode();

        //Generate QR code with unique identifier
        const qrCodeUrl = await generateQRCodeForTicket(
          String(newOrder._id),
          code
        );

        //Create ticket instance
        const ticket = new TicketModel({
          orderId: newOrder._id,
          buyerId: user._id,
          status: "reserved",
          type: ticketData.type,
          name: ticketData.name,
          code,
          qrCode: qrCodeUrl,
          startDate: duration.startDate,
          endDate: duration.endDate,
          value: calculateTicketValue(ticketData),
          attendee: {
            name: ticketData.attendee.name,
            email: ticketData.attendee.email,
          },
          checkoutResponses: ticketData.checkoutResponses,
          event: {
            name: event.basics.name,
            location: {
              address: event.basics.location.address,
              venueName: event.basics.location?.venueName,
              connectionDetails: event.basics.location?.connectionDetails,
            },
            organizerName:
              hostProfile.info.userType === "individual"
                ? `${hostProfile.info.firstName} ${hostProfile.info.lastName}`
                : hostProfile.info.organizationName,
            coverPhoto: event.additionalDetails.eventCoverPhoto,
          },
        });

        await ticket.save();
      }
    }

    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export default generateTickets;
