import { db } from "../database";
import { Feeding, feedings } from "../database/schema";
import { desc } from "drizzle-orm";

export async function getFeedings() {
  return db.select().from(feedings).orderBy(desc(feedings.createdAt)).limit(10);
}

export async function logFeeding(input: { cat: Feeding["cat"]; foodType: Feeding["foodType"] }) {
  await db.insert(feedings).values({
    ...input,
    createdAt: new Date(),
  });
}
