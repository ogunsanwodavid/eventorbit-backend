import { Request, Response, NextFunction } from "express";

import { ProcessOrderInput } from "../../utils/schema-validations/orders/processOrderSchemaValidation";

export interface PaymentResult {
  success: boolean;
  message: string;
}

const validateCardPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    //Get payment credentials from request body
    const { paymentCredentials } = req.body as ProcessOrderInput["body"];

    //Get info from credentials
    const { cardNumber, expiry, cvc } = paymentCredentials;

    //Payment result
    let paymentResult: PaymentResult;

    //Validate presence of required fields
    if (!cardNumber || !expiry || !cvc) {
      paymentResult = {
        success: false,
        message: "Missing required payment fields: cardNumber, expiry, or cvc",
      };
    }

    //Validate cardNumber (13–19 digits)
    if (!/^\d{13,19}$/.test(cardNumber)) {
      paymentResult = {
        success: false,
        message: "Card number must be 13–19 digits",
      };
    }

    //Validate expiry (MM/YY format and future date)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      paymentResult = {
        success: false,
        message: "Expiry must be in MM/YY format",
      };
    }

    //Split expiry date to month and year
    const [month, year] = expiry.split("/").map((key) => Number(key));

    //Get expiry as JS Date
    const expiryDate = new Date(Number(`20${year}`), month - 1); // e.g., "12/26" -> Dec 2026
    const now = new Date("2025-06-10T02:33:00+01:00"); // June 10, 2025, 02:33 AM WAT

    //Check card validity
    if (expiryDate <= now) {
      paymentResult = {
        success: false,
        message: "Card has expired",
      };
    }

    // Validate cvc (3–4 digits)
    if (!/^\d{3,4}$/.test(cvc)) {
      paymentResult = {
        success: false,
        message: "CVC must be 3 or 4 digits",
      };
    }

    //If no error, make payment result successful
    paymentResult = {
      success: true,
      message: "Payment processed!!",
    };

    //Attach payment result to request
    (req as any).paymentResult = paymentResult as PaymentResult;

    next();
  } catch (error) {
    next(error);
  }
};

export default validateCardPayment;
