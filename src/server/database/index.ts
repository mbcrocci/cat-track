import { drizzle } from 'drizzle-orm/libsql'
import { env } from '@/env'

// You can specify any property from the libsql connection options
export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  },
})
