import { getSession } from '@/shared/auth/config'
import { getPlatformDb, getTenantDb } from '@/shared/db'
import {
  platformMemberships,
  platformTenants,
  platformUsers,
} from '@/shared/db/schema/platform-schema'
import { roles, userRoles, users } from '@/shared/db/schema/identity'
import { staffProfiles } from '@/shared/db/schema/branches'
import { and, eq } from 'drizzle-orm'
import { runWithRequestContext, setRequestContext, type RequestContext } from './request-context'
import {
  resolveUserRole,
  validateRoleForFlow,
  type RoleCategory,
} from '@/shared/auth/role-resolver'

type TenantRequest = {
  context: RequestContext
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>
}

/**
 * Stable resolution result per (session token, tenant): membership, tenant row
 * and local user identity. Cached briefly to avoid re-querying the platform DB
 * on every request.
 */
type ResolvedIdentity = {
  tenantId: string
  tenantStatus: string
  databaseUrl: string
  platformUserId: string
  localUserId: string | null
  userRole: string
  isPlatformAdmin: boolean
}

const IDENTITY_CACHE_TTL_MS = 30_000
const identityCache = new Map<string, { identity: ResolvedIdentity; expiresAt: number }>()

function getRequestedTenantId(headers: Headers, sessionUser: unknown) {
  const tenantId =
    typeof sessionUser === 'object' && sessionUser !== null && 'tenantId' in sessionUser
      ? (sessionUser as { tenantId?: unknown }).tenantId
      : undefined
  const fromHeaders = headers.get('x-tenant-id')
  if (fromHeaders) return fromHeaders
  return typeof tenantId === 'string' ? tenantId : undefined
}

function getSessionToken(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const token = (session as { session?: { token?: string } }).session?.token
  return token || session.user.email
}

export function resolveDatabaseUrl(tenant: typeof platformTenants.$inferSelect) {
  const ref = tenant.databaseSecretRef
  if (ref?.startsWith('postgres://') || ref?.startsWith('postgresql://')) {
    const u = new URL(ref)
    if (u.password && u.password.length < 8 && process.env.DATABASE_URL) {
      return process.env.DATABASE_URL
    }
    // Si DATABASE_URL existe, siempre usarlo (el ref puede apuntar a una DB que no existe)
    if (process.env.DATABASE_URL) {
      return process.env.DATABASE_URL
    }
    return ref
  }

  // PRIORIDAD 1: DATABASE_URL (como en commit 3c2324d)
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  // PRIORIDAD 2: TENANT_DATABASE_URL_TEMPLATE (fallback)
  const template = process.env.TENANT_DATABASE_URL_TEMPLATE
  if (template && tenant.databaseName) {
    return template.replace('{database}', encodeURIComponent(tenant.databaseName))
  }

  throw new Error('TENANT_DATABASE_NOT_CONFIGURED')
}

function getCachedIdentity(cacheKey: string): ResolvedIdentity | null {
  const cached = identityCache.get(cacheKey)
  if (!cached) return null
  if (cached.expiresAt < Date.now()) {
    identityCache.delete(cacheKey)
    return null
  }
  return cached.identity
}

function setCachedIdentity(cacheKey: string, identity: ResolvedIdentity) {
  identityCache.set(cacheKey, { identity, expiresAt: Date.now() + IDENTITY_CACHE_TTL_MS })
  if (identityCache.size > 1000) {
    const oldestKey = identityCache.keys().next().value
    if (oldestKey) identityCache.delete(oldestKey)
  }
}

/**
 * Resolves membership + tenant + local user in as few round-trips as possible:
 * 1 query joining memberships/users/tenants on the platform DB, and 1 joined
 * query for the local user role on the tenant DB. Results are cached for
 * IDENTITY_CACHE_TTL_MS per session token.
 */
async function resolveIdentity(
  headers: Headers,
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
  requestedTenantId: string,
  expectedFlow?: RoleCategory
): Promise<ResolvedIdentity | null> {
  const cacheKey = `${getSessionToken(session)}:${requestedTenantId || '*'}`
  const cached = getCachedIdentity(cacheKey)
  if (cached) return cached

  const platformDb = getPlatformDb()

  const platformUserResult = await platformDb
    .select({
      id: platformUsers.id,
      email: platformUsers.email,
    })
    .from(platformUsers)
    .where(eq(platformUsers.email, session.user.email))
    .limit(1)

  const platformUserId = platformUserResult[0]?.id
  let row: {
    membershipRole: string
    tenantId: string | null
    tenantStatus: string
    databaseName: string | null
    databaseSecretRef: string | null
    platformUserId: string
  } | null = null

if (platformUserId) {
    const platformAdmin = await platformDb
      .select({
        membershipRole: platformMemberships.role,
        platformUserId: platformUsers.id,
      })
      .from(platformMemberships)
      .innerJoin(platformUsers, eq(platformMemberships.userId, platformUsers.id))
      .where(
        and(eq(platformMemberships.userId, platformUserId), eq(platformMemberships.role, 'platform_admin'))
      )
      .limit(1) as any

    if (platformAdmin) {
      const identity: ResolvedIdentity = {
        tenantId: '',
        tenantStatus: 'active',
        databaseUrl: '',
        platformUserId: platformAdmin.platformUserId,
        localUserId: null,
        userRole: 'platform_admin',
        isPlatformAdmin: true,
      }
      setCachedIdentity(cacheKey, identity)
      return identity
    }

    if (!requestedTenantId) {
      row = await platformDb
        .select({
          membershipRole: platformMemberships.role,
          tenantId: platformTenants.id,
          tenantStatus: platformTenants.status,
          databaseName: platformTenants.databaseName,
          databaseSecretRef: platformTenants.databaseSecretRef,
          platformUserId: platformUsers.id,
        })
        .from(platformMemberships)
        .innerJoin(platformUsers, eq(platformMemberships.userId, platformUsers.id))
        .innerJoin(platformTenants, eq(platformMemberships.tenantId, platformTenants.id))
        .where(
          and(
            eq(platformMemberships.userId, platformUserId),
            eq(platformMemberships.status, 'active'),
            eq(platformTenants.status, 'active')
          )
        )
        .limit(1) as any
    } else {
      row = await platformDb
        .select({
          membershipRole: platformMemberships.role,
          tenantId: platformTenants.id,
          tenantStatus: platformTenants.status,
          databaseName: platformTenants.databaseName,
          databaseSecretRef: platformTenants.databaseSecretRef,
          platformUserId: platformUsers.id,
        })
        .from(platformMemberships)
        .innerJoin(platformUsers, eq(platformMemberships.userId, platformUsers.id))
        .innerJoin(platformTenants, eq(platformMemberships.tenantId, platformTenants.id))
        .where(
          and(
            eq(platformMemberships.userId, platformUserId),
            eq(platformMemberships.tenantId, requestedTenantId),
            eq(platformMemberships.status, 'active'),
            eq(platformTenants.status, 'active')
          )
        )
        .limit(1) as any
    }
  }

  if (!row) return null

  const isPlatformAdmin = row.membershipRole === 'platform_admin'

  if (expectedFlow && !isPlatformAdmin) {
    const identity = await resolveUserRole(session.user.email, requestedTenantId)
    if (!identity.role || !validateRoleForFlow(identity.role, expectedFlow)) {
      return null
    }
  }

  const identity: ResolvedIdentity = {
    tenantId: row.tenantId || '',
    tenantStatus: row.tenantStatus,
    databaseUrl: resolveDatabaseUrl({
      databaseName: row.databaseName,
      databaseSecretRef: row.databaseSecretRef,
    } as typeof platformTenants.$inferSelect),
    platformUserId: row.platformUserId,
    localUserId: null,
    userRole: row.membershipRole,
    isPlatformAdmin: row.membershipRole === 'platform_admin',
  }

  try {
    const [local] = await getTenantDb()
      .select({
        id: users.id,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (local) {
      identity.localUserId = local.id
      identity.userRole = local.roleName || identity.userRole
    }
  } catch {
    // Tenant DB may not be provisioned yet; fall back to platform identity.
  }

  setCachedIdentity(cacheKey, identity)
  return identity
}

async function buildContext(
  headers: Headers,
  identity: ResolvedIdentity,
  sessionUserId: string
): Promise<RequestContext> {
  const localUserId = identity.localUserId || sessionUserId
  let staffId: string | undefined

  if (identity.isPlatformAdmin && !identity.tenantId) {
    return {
      tenantId: '',
      userId: localUserId,
      userRole: identity.userRole,
      databaseUrl: '',
      requestId: headers.get('x-request-id') || crypto.randomUUID(),
      ipAddress: headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: headers.get('user-agent') || undefined,
    }
  }

  if (localUserId && identity.tenantId) {
    try {
      const [staff] = await getTenantDb()
        .select({ id: staffProfiles.id })
        .from(staffProfiles)
        .where(and(eq(staffProfiles.userId, localUserId), eq(staffProfiles.tenantId, identity.tenantId)))
        .limit(1)
      staffId = staff?.id
    } catch {
      // Staff profile may not exist for this user
    }
  }

  return {
    tenantId: identity.tenantId || '',
    userId: localUserId,
    userRole: identity.userRole,
    staffId,
    databaseUrl: identity.databaseUrl,
    requestId: headers.get('x-request-id') || crypto.randomUUID(),
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    userAgent: headers.get('user-agent') || undefined,
  }
}

export async function resolveTenantRequest(
  headers: Headers,
  expectedFlow?: RoleCategory
): Promise<TenantRequest | null> {
  const session = await getSession(headers)
  if (!session) return null

  const requestedTenantId = getRequestedTenantId(headers, session.user)

  const identity = await resolveIdentity(headers, session, requestedTenantId || '', expectedFlow)
  if (!identity) return null

  if (identity.isPlatformAdmin && !requestedTenantId) {
    return {
      session,
      context: await buildContext(headers, identity, session.user.id),
    }
  }

  if (!requestedTenantId) return null

  return {
    session,
    context: await buildContext(headers, identity, session.user.id),
  }
}

export function invalidateIdentityCache(sessionToken?: string) {
  if (!sessionToken) {
    identityCache.clear()
    return
  }
  for (const key of identityCache.keys()) {
    if (key.startsWith(`${sessionToken}:`)) identityCache.delete(key)
  }
}

/**
 * Pre-loads the identity cache so that subsequent API calls
 * don't trigger a slow identity resolution on the first request.
 * Call this after login and before the user navigates.
 */
export async function preloadIdentity(headers: Headers, tenantId: string): Promise<void> {
  const session = await getSession(headers)
  if (!session) return

  const cacheKey = `${getSessionToken(session)}:${tenantId}`
  const cached = getCachedIdentity(cacheKey)
  if (cached) return

  const identity = await resolveIdentity(headers, session, tenantId)
  if (identity) {
    setCachedIdentity(cacheKey, identity)
  }
}

export async function getTenantSession(headers: Headers) {
  const request = await resolveTenantRequest(headers)
  if (!request) return null
  setRequestContext(request.context)
  return request.session
}

export async function withTenantRequest<T>(
  headers: Headers,
  callback: (request: TenantRequest) => Promise<T>
) {
  const request = await resolveTenantRequest(headers)
  if (!request) return null
  return runWithRequestContext(request.context, () => callback(request))
}
