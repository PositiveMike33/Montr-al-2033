/**
 * Database Client — Drizzle ORM + PostgreSQL Connection
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const SQL_HOST = process.env.SQL_HOST || "localhost";
const SQL_USER = process.env.SQL_USER || "postgres";
const SQL_PASSWORD = process.env.SQL_PASSWORD || "postgres";
const SQL_PORT = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 5432;
const SQL_DATABASE = process.env.SQL_DATABASE || "montreal2033";

const connectionString = `postgres://${SQL_USER}:${SQL_PASSWORD}@${SQL_HOST}:${SQL_PORT}/${SQL_DATABASE}`;

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    try {
      const client = postgres(connectionString);
      db = drizzle(client, { schema });
      console.log(`[Database] Connected to ${SQL_HOST}:${SQL_PORT}/${SQL_DATABASE}`);
    } catch (error) {
      console.error("[Database] Connection failed:", error);
      throw error;
    }
  }
  return db;
}

export { schema };
