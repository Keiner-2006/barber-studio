import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { getPlatformDb } from '@/shared/db'
import { platformUsers, platformMemberships, platformTenants } from '@/shared/db/schema/platform-schema'
import { branches } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const session = await getSession(request.headers)
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId },
        { status: 401 }
      )
    }

    const db = getPlatformDb()

    const platformUser = await db.query.platformUsers.findFirst({
      where: eq(platformUsers.email, session.user.email),
    })
    if (!platformUser) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Usuario no encontrado en la plataforma' }, requestId },
        { status: 401 }
      )
    }

    const membership = await db.query.platformMemberships.findFirst({
      where: and(
        eq(platformMemberships.userId, platformUser.id),
        eq(platformMemberships.status, 'active')
      ),
    })
    if (!membership) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Sin membresía activa' }, requestId },
        { status: 403 }
      )
    }

    const tenant = await db.query.platformTenants.findFirst({
      where: and(
        eq(platformTenants.id, membership.tenantId),
        eq(platformTenants.status, 'active')
      ),
    })
    if (!tenant) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Tenant inactivo' }, requestId },
        { status: 403 }
      )
    }

    const tenantBranches = await db.query.branches.findMany({
      where: and(
        eq(branches.tenantId, tenant.id),
        eq(branches.status, 'active')
      ),
    })

    return NextResponse.json({
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.tradeName || tenant.legalName,
          slug: tenant.slug,
          currencyCode: tenant.currencyCode,
          countryCode: tenant.countryCode,
          timezone: tenant.timezone,
        },
        branches: tenantBranches.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          status: b.status,
          timezone: b.timezone,
        })),
      },
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
