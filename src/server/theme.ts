import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

const postThemeValidator = z.union([z.literal("system"), z.literal("light"), z.literal("dark")]);
export type T = z.infer<typeof postThemeValidator>;
const storageKey = "_cat_track_theme";

export const getThemeServerFn = createServerFn().handler(
  async () => (getCookie(storageKey) || "system") as T,
);

export const setThemeServerFn = createServerFn({ method: "POST" })
  .inputValidator(postThemeValidator)
  .handler(async ({ data }) => setCookie(storageKey, data));
