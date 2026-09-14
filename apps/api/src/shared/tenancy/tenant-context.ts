import { getSession } from '@/shared/auth/config'
import { getPlatformDb, getTenantDb } from '@/shared/db'
import { platformMemberships, platformTenants, platformUsers } from '@/shared/db/schema/platform-schema'
import { roles, userRoles, users } from '@/shared/db/schema/identity'
import { and, eq } from 'drizzle-orm'
import { runWithRequestContext, setRequestContext, type RequestContext } from './request-context'

type TenantRequest = {
  context: RequestContext
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>
}

function getRequestedTenantId(headers: Headers, sessionUser: unknown) {
  const tenantId =
    typeof sessionUser === 'object' && sessionUser !== null && 'tenantId' in sessionUser
      ? sessionUser.tenantId
      : undefined
  return headers.get('x-tenant-id') || (typeof tenantId === 'string' ? tenantId : undefined)
}

function resolveDatabaseUrl(tenant: typeof platformTenants.$inferSelect) {
  if (tenant.databaseSecretRef?.startsWith('postgres://') || tenant.databaseSecretRef?.startsWith('postgresql://')) {
    return tenant.databaseSecretRef
  }

  const template = process.env.TENANT_DATABASE_URL_TEMPLATE
  if (template && tenant.databaseName) {
    return template.replace('{database}', encodeURIComponent(tenant.databaseName))
  }

  if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  throw new Error('TENANT_DATABASE_NOT_CONFIGURED')
}

export async function resolveTenantRequest(headers: Headers): Promise<TenantRequest | null> {
  const session = await getSession(headers)
  if (!session) return null

  const requestedTenantId = getRequestedTenantId(headers, session.user)
  if (!requestedTenantId) return null

  const platformDb = getPlatformDb()
  const platformUser = await platformDb.query.platformUsers.findFirst({
    where: eq(platformUsers.email, session.user.email),
  })
  if (!platformUser) return null

  const membership = await platformDb.query.platformMemberships.findFirst({
    where: and(
      eq(platformMemberships.tenantId, requestedTenantId),
      eq(platformMemberships.userId, platformUser.id),
      eq(platformMemberships.status, 'active'),
    ),
  })
  if (!membership) return null

  const tenant = await platformDb.query.platformTenants.findFirst({
    where: and(eq(platformTenants.id, membership.tenantId), eq(platformTenants.status, 'active')),
  })
  if (!tenant) return null

  return {
    session,
    context: {
      tenantId: tenant.id,
      userId: session.user.id,
      userRole: membership.role,
      databaseUrl: resolveDatabaseUrl(tenant),
      requestId: headers.get('x-request-id') || crypto.randomUUID(),
      ipAddress: headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: headers.get('user-agent') || undefined,
    },
  }
}

export async function getTenantSession(headers: Headers) {
  const request = await resolveTenantRequest(headers)
  if (!request) return null
  setRequestContext(request.context)

  const localUser = await getTenantDb().query.users.findFirst({
    where: eq(users.email, request.session.user.email),
  })
  if (localUser) {
    const localRole = await getTenantDb()
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, localUser.id))
      .limit(1)

    setRequestContext({
      ...request.context,
      userId: localUser.id,
      userRole: localRole[0]?.name || request.context.userRole,
    })
  }

  return request.session
}

export async function withTenantRequest<T>(headers: Headers, callback: (request: TenantRequest) => Promise<T>) {
  const request = await resolveTenantRequest(headers)
  if (!request) return null
  return runWithRequestContext(request.context, async () => {
    const localUser = await getTenantDb().query.users.findFirst({
      where: eq(users.email, request.session.user.email),
    })
    const localRole = localUser
      ? await getTenantDb()
          .select({ name: roles.name })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, localUser.id))
          .limit(1)
      : []

    const context = localUser
      ? { ...request.context, userId: localUser.id, userRole: localRole[0]?.name || request.context.userRole }
      : request.context
    setRequestContext(context)
    return callback({ ...request, context })
  })
}