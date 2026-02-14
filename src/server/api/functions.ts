import { createServerFn } from "@tanstack/react-start";
import { differenceInHours, differenceInMinutes, format, startOfDay, subDays } from "date-fns";
import { z } from "zod";
import {
  getFeedingsForStats,
  getFeedings as getFeedingsFromDB,
  logFeeding as logFeedingDB,
  deleteFeeding as deleteFeedingDB,
} from "./server";
import type { Feeding } from "../database/schema";

export const logFeeding = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      cat: z.enum(["mittens", "vaquinha", "both"]),
      foodType: z.enum(["dry", "wet"]),
    }),
  )
  .handler(async ({ data }) => {
    if (data.cat === "both") {
      return Promise.all([
        logFeedingDB({ ...data, cat: "mittens" }),
        logFeedingDB({ ...data, cat: "vaquinha" }),
      ]);
    }

    return logFeedingDB(data);
  });

export const deleteFeeding = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return deleteFeedingDB(data.id);
  });

export const getFeedings = createServerFn().handler(() => {
  return getFeedingsFromDB();
});

const defaultCatFeeding = (cat: "mittens" | "vaquinha") => ({
  name: cat,
  hours: 0,
  minutes: 0,
  lastFedAt: "Never",
  status: "hungry",
  delay: 0,
  foodType: null as "dry" | "wet" | null,
});

const getCatFeeding = (cat: "mittens" | "vaquinha", feeding: Array<Feeding>) => {
  const lastFeeding = feeding.find((f) => f.cat === cat);
  if (!lastFeeding) {
    return defaultCatFeeding(cat);
  }

  const hoursSinceLastFeeding = differenceInHours(new Date(), lastFeeding.createdAt);
  const minutesSinceLastFeeding = differenceInMinutes(new Date(), lastFeeding.createdAt);
  const status = hoursSinceLastFeeding > 2 ? "hungry" : "fed";

  return {
    name: lastFeeding.cat,
    hours: hoursSinceLastFeeding,
    minutes: minutesSinceLastFeeding % 60,
    lastFedAt: format(lastFeeding.createdAt, "HH:mm PPP"),
    status,
    delay: 0,
    foodType: lastFeeding.foodType,
  };
};

export const getLastFeedings = createServerFn().handler(async () => {
  const feeding = await getFeedingsFromDB();
  if (feeding.length === 0) {
    console.log("No feedings found");
    return {
      mittens: defaultCatFeeding("mittens"),
      vaquinha: defaultCatFeeding("vaquinha"),
    };
  }

  return {
    mittens: getCatFeeding("mittens", feeding),
    vaquinha: getCatFeeding("vaquinha", feeding),
  };
});

export type StatsData = {
  byDay: Array<{ date: string; count: number; mittens: number; vaquinha: number }>;
  byCat: Array<{ cat: string; count: number }>;
  byFoodType: Array<{ foodType: string; count: number }>;
  recent: Array<{ id: number; cat: string; foodType: string; createdAt: Date }>;
};

export const getStats = createServerFn().handler(async (): Promise<StatsData> => {
  const rows = await getFeedingsForStats();
  const now = new Date();
  const daysBack = 14;
  const dayKeys = Array.from({ length: daysBack }, (_, i) => {
    const d = subDays(now, daysBack - 1 - i);
    return format(startOfDay(d), "yyyy-MM-dd");
  });
  const byDayMap = new Map<string, { total: number; mittens: number; vaquinha: number }>(
    dayKeys.map((k) => [k, { total: 0, mittens: 0, vaquinha: 0 }]),
  );
  const byCatMap = new Map<string, number>([
    ["mittens", 0],
    ["vaquinha", 0],
  ]);
  const byFoodTypeMap = new Map<string, number>([
    ["dry", 0],
    ["wet", 0],
  ]);

  for (const row of rows) {
    const dayKey = format(startOfDay(row.createdAt), "yyyy-MM-dd");
    if (byDayMap.has(dayKey)) {
      const entry = byDayMap.get(dayKey)!;
      entry.total += 1;
      if (row.cat === "mittens") entry.mittens += 1;
      else if (row.cat === "vaquinha") entry.vaquinha += 1;
    }
    byCatMap.set(row.cat, (byCatMap.get(row.cat) ?? 0) + 1);
    byFoodTypeMap.set(row.foodType, (byFoodTypeMap.get(row.foodType) ?? 0) + 1);
  }

  return {
    byDay: dayKeys.map((date) => {
      const entry = byDayMap.get(date)!;
      return { date, count: entry.total, mittens: entry.mittens, vaquinha: entry.vaquinha };
    }),
    byCat: Array.from(byCatMap.entries()).map(([cat, count]) => ({
      cat,
      count,
    })),
    byFoodType: Array.from(byFoodTypeMap.entries()).map(([foodType, count]) => ({
      foodType,
      count,
    })),
    recent: rows.slice(0, 20).map((r) => ({
      id: r.id,
      cat: r.cat,
      foodType: r.foodType,
      createdAt: r.createdAt,
    })),
  };
});
