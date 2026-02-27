import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// ─────────────────────────────────────────────────────────────
// Create a connection pool using environment variables.
// Pool reuses connections instead of opening a new one per query.
// ─────────────────────────────────────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Pool configuration
  max: 10,               // max number of connections in the pool
  idleTimeoutMillis: 30000,    // close idle connections after 30s
  connectionTimeoutMillis: 2000, // fail fast if can't connect in 2s
});

// Log successful connection in development
pool.on("connect", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("✅ New DB connection established");
  }
});

// Log pool errors (e.g. DB restarts)
pool.on("error", (err) => {
  console.error("❌ Unexpected DB pool error:", err.message);
  process.exit(1);
});

export default pool;