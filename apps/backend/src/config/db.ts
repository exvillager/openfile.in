import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { CONFIG } from ".";
import * as schema from "../db/index.js";

export type DBClient = ReturnType<typeof drizzle>;

export const createDBClient = (name: "drizzle" | "sqlite" = "drizzle"): any => {
  switch (name) {
    case "sqlite": {
      // Bun-only local dev path (`DB_CLIENT=sqlite`, `bun run dev:local`). Imported
      // lazily so `bun:sqlite` isn't statically bundled into the Node production build.
      const { Database } = require('bun:sqlite');
      const { drizzle: sqliteDrizzle } = require('drizzle-orm/bun-sqlite');
      const sqliteSchema = require('../db/sqlite-schema.js');
      const sqlite = new Database('./dev.db');
      return sqliteDrizzle(sqlite, { schema: sqliteSchema });
    }
    case "drizzle":
    default: {
      const pool = new Pool({ connectionString: CONFIG.DATABASE_URL! });
      return drizzle(pool, { schema });
    }
  }
};
