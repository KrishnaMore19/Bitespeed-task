import express from "express";
import dotenv from "dotenv";
import identifyRouter from "./routes/identify.routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// Global Middlewares
// ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────


app.use("/", identifyRouter);

// Welcome route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "🚀 Bitespeed Identity Reconciliation API",
    version: "1.0.0",
    endpoints: {
      health:   "GET  /health",
      identify: "POST /identify",
    },
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
// ─────────────────────────────────────────────────────────────
// Global Error Handler (must be last)
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;