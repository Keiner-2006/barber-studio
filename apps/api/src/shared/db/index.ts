import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { getRequestContext } from '@/shared/tenancy/request-context'

const platformPool = new Pool({
  connectionString: process.env.PLATFORM_DATABASE_URL || process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

const platformDb = drizzle(platformPool, { schema })
const tenantPools = new Map<string, Pool>()
const tenantDbs = new Map<string, typeof platformDb>()

export function getPlatformDb() {
  return platformDb
}

export function getTenantDb() {
  const { tenantId, databaseUrl } = getRequestContext()
  const existing = tenantDbs.get(tenantId)
  if (existing) return existing

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  })
  const db = drizzle(pool, { schema }) as typeof platformDb
  tenantPools.set(tenantId, pool)
  tenantDbs.set(tenantId, db)
  return db
}

export const db = new Proxy({} as typeof platformDb, {
  get(_target, property) {
    return Reflect.get(getTenantDb(), property)
  },
})
