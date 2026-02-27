import { Request, Response, NextFunction } from "express";
import { identifyContact } from "../services/contact.service";
import { IdentifyRequestBody } from "../types/contact.types";

// ─────────────────────────────────────────────────────────────
// POST /identify
// Accepts email and/or phoneNumber, returns consolidated contact
// ─────────────────────────────────────────────────────────────
export const identify = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, phoneNumber }: IdentifyRequestBody = req.body;

    // Validation: at least one field must be present
    if (!email && !phoneNumber) {
      res.status(400).json({
        error: "Bad Request",
        message: "At least one of 'email' or 'phoneNumber' must be provided.",
      });
      return;
    }

    const contact = await identifyContact({ email, phoneNumber });

    res.status(200).json({ contact });

  } catch (error) {
    next(error); // forward to global error handler
  }
};