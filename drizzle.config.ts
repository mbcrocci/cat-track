import { defineConfig } from 'drizzle-kit'
import { env } from '@/env'

export default defineConfig({
  dialect: 'turso',
  schema: './src/server/database/schema.ts',
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_TOKEN,
  },
})
