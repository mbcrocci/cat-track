import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const feedings = sqliteTable("feeding", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  cat: text("cat", { enum: ["mittens", "vaquinha", "both"] }).notNull(),
  foodType: text("foodType", { enum: ["dry", "wet"] }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});

export type Feeding = typeof feedings.$inferSelect;
