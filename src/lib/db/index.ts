import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn("DATABASE_URL is not set - database queries will fail at runtime");
}

// Use fallback to avoid crash at module load; queries will fail if DB is unavailable.
// Pages with try-catch fallbacks handle this gracefully.
const client = postgres(databaseUrl ?? "postgres://localhost:5432");
export const db = drizzle(client, { schema });
