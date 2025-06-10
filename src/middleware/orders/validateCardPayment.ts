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

    const { cardNumber, expiry, cvc } = paymentCredentials;

    //Validate presence of required fields
    if (!cardNumber || !expiry || !cvc) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields: cardNumber, expiry, or cvc",
      });
    }

    //Validate cardNumber (13–19 digits)
    if (!/^\d{13,19}$/.test(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: "Card number must be 13–19 digits",
      });
    }

    //Validate expiry format (MM/YY)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      return res.status(400).json({
        success: false,
        message: "Expiry must be in MM/YY format",
      });
    }

    //Split and validate expiry date
    const [month, year] = expiry.split("/").map(Number);
    const expiryDate = new Date(2000 + year, month - 1); //JS months are 0-indexed
    const now = new Date();

    if (expiryDate <= now) {
      return res.status(400).json({
        success: false,
        message: "Card has expired",
      });
    }

    //Validate CVC (3–4 digits)
    if (!/^\d{3,4}$/.test(cvc)) {
      return res.status(400).json({
        success: false,
        message: "CVC must be 3 or 4 digits",
      });
    }

    //If all validations pass
    (req as any).paymentResult = {
      success: true,
      message: "Payment validated successfully",
    };

    next();
  } catch (error) {
    console.error("Payment validation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during payment validation",
    });
  }
};

export default validateCardPayment;
