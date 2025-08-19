import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Links table schema
export const links = sqliteTable("links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  title: text("title").notNull(),
  label: text("label").notNull(),
  userId: text("user_id").notNull(), // Clerk user ID
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

// Type inference for TypeScript
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
