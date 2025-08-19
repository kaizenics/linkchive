import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Validate environment variables
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error(
    "TURSO_DATABASE_URL is not set. Please add it to your environment variables."
  );
}

if (!authToken) {
  throw new Error(
    "TURSO_AUTH_TOKEN is not set. Please add it to your environment variables."
  );
}

// Create the TursoDB client
const client = createClient({
  url: databaseUrl,
  authToken: authToken,
});

// Create the Drizzle database instance
export const db = drizzle(client, { schema });

// Export the client for direct access if needed
export { client };
