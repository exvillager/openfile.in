import { drizzle } from "drizzle-orm/node-postgres";
import { drizzle as sqliteDrizzle } from "drizzle-orm/bun-sqlite";
import { Pool } from "pg";
import { Database } from "bun:sqlite";
import { CONFIG } from ".";
import * as schema from "../db/index.js";
import * as sqliteSchema from "../db/sqlite-schema.js";

export type DBClient = ReturnType<typeof drizzle>;

export const createDBClient = (name: "drizzle" | "sqlite" = "drizzle"): any => {
  switch (name) {
    case "sqlite": {
      const sqlite = new Database("./dev.db");
      return sqliteDrizzle(sqlite, { schema: sqliteSchema });
    }
    case "drizzle":
    default: {
      const pool = new Pool({ connectionString: CONFIG.DATABASE_URL! });
      return drizzle(pool, { schema });
    }
  }
};
