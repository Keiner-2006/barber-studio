import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { getRequestContext } from '@/shared/tenancy/request-context'
import crypto from 'node:crypto'

function logConnectionInfo(url: string, label: string) {
  try {
    const u = new URL(url)
    const password = u.password || ''
    const hasWeirdChars = /^[\s"'\\]|[\s"'\\]$/.test(password)
    const sha = crypto.createHash('sha256').update(password).digest('hex').slice(0, 6)
    console.log(`[DB] ${label} → host=${u.hostname} port=${u.port || 5432} db=${u.pathname.slice(1)} user=${u.username} pwd_len=${password.length} pwd_sha256=${sha}${hasWeirdChars ? ' ⚠️ TRIM_PASSWORD' : ''}`)
  } catch {
    console.log(`[DB] ${label} → invalid URL`)
  }
}

let _logged = false
function getConnectionString(): string {
  const url = process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL || ''
  const withSsl = url.includes('sslmode=') ? url : url + '?sslmode=require'
  return withSsl.replace(/sslmode=(prefer|require|verify-ca|verify-full)/i, 'sslmode=verify-full')
}

function getPlatformPool(): Pool {
  if (!_logged) {
    const url = process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL || ''
    const varName = process.env.DATABASE_URL ? 'DATABASE_URL' : 'PLATFORM_DATABASE_URL'
    logConnectionInfo(url, varName)
    _logged = true
  }
  return new Pool({
    connectionString: getConnectionString(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: true },
  })
}

const platformPool = getPlatformPool()

if (!process.env.PLATFORM_DATABASE_URL && !process.env.DATABASE_URL) {
  console.error('DATABASE_URL or PLATFORM_DATABASE_URL is not configured')
}

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

  logConnectionInfo(databaseUrl, `TENANT_DATABASE_URL (${tenantId})`)

  const tenantUrl = databaseUrl.includes('sslmode=') ? databaseUrl : databaseUrl + '?sslmode=require'
  const pool = new Pool({
    connectionString: tenantUrl.replace(/sslmode=(prefer|require|verify-ca|verify-full)/i, 'sslmode=verify-full'),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: true },
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
