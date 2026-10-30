import { Pool } from "pg";
import { CONFIG } from "@/config"; // throws at import time if required env vars are missing
import { createApp } from "./app";

async function checkDB() {
  const pool = new Pool({ connectionString: CONFIG.DATABASE_URL });
  try {
    await pool.query("SELECT 1");
    console.log("[DB] Connection OK");
  } finally {
    await pool.end();
  }
}

export async function startServer() {
  await checkDB();

  const app = createApp();
  const port = CONFIG.PORT || 8000;

  Bun.serve({
    port,
    fetch: app.fetch as any,
    // several worker processes share the port; the kernel spreads connections between them (Linux)
    reusePort: process.env.OPENFILE_WORKER !== undefined,
    // key: Bun.file("./localhost.key"),
    // cert: Bun.file("./localhost.crt"),
  });

  console.log(
    `Listening on http://localhost:${port} (worker ${process.env.OPENFILE_WORKER ?? "solo"}, pid ${process.pid})`,
  );
}
