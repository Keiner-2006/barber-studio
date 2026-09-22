import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

try { config({ path: '.env.local' }) } catch {}

export default defineConfig({
  schema: './src/shared/db/schema/**/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
