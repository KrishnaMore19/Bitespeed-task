import { Request, Response, NextFunction } from "express";

// ─────────────────────────────────────────────────────────────
// Global error handler middleware.
// Must be registered LAST in express app (after all routes).
// ─────────────────────────────────────────────────────────────
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("❌ Unhandled Error:", err.message);

  res.status(500).json({
    error:   "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};