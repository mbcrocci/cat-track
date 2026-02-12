import { env } from "@/env";
import { drizzle } from "drizzle-orm/libsql";

// You can specify any property from the libsql connection options
export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  },
});
