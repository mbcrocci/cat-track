import { desc } from "drizzle-orm";
import { db } from "../database";
import { feedings } from "../database/schema";
import type { Feeding } from "../database/schema";

export async function getFeedings() {
  return db.select().from(feedings).orderBy(desc(feedings.createdAt)).limit(10);
}

/** Used only by getStats; does not replace or change getFeedings. */
export async function getFeedingsForStats() {
  return db.select().from(feedings).orderBy(desc(feedings.createdAt)).limit(100);
}

export async function logFeeding(input: { cat: Feeding["cat"]; foodType: Feeding["foodType"] }) {
  await db.insert(feedings).values({
    ...input,
    createdAt: new Date(),
  });
}
