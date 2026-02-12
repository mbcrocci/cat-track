import { createServerFn } from "@tanstack/react-start";
import { logFeeding as logFeedingDB, getFeedings as getFeedingsFromDB } from "./server";
import { differenceInHours, differenceInMinutes, format } from "date-fns";
import { z } from "zod";
import { Feeding } from "../database/schema";

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

const getCatFeeding = (cat: "mittens" | "vaquinha", feeding: Feeding[]) => {
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
    minutes: minutesSinceLastFeeding,
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
