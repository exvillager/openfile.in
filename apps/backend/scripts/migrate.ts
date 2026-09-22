import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const url = process.env.DATABASE_URL!;
const isLocal = url.includes("127.0.0.1") || url.includes("localhost");

const pool = new Pool({
    connectionString: url,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
});

await migrate(drizzle(pool), { migrationsFolder: "./drizzle" });
await pool.end();

console.log("[migrate] schema is up to date");
