import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { getPlatformDb } from '@/shared/db'
import {
  platformUsers,
  platformMemberships,
  platformTenants,
  tenantBranding,
} from '@/shared/db/schema/platform-schema'
import { eq, and, sql, desc, inArray } from 'drizzle-orm'

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
        inArray(platformMemberships.role, ['platform_admin', 'platform_support'])
      ),
    })
    if (!membership) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Acceso de administrador requerido' }, requestId },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')
    const withList = searchParams.get('list') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)

    const whereClause = statusFilter
      ? and(eq(platformTenants.status, statusFilter as typeof platformTenants.$inferSelect.status))
      : undefined

    const [totalCountRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(platformTenants)
      .where(whereClause ?? undefined)
      .limit(1)

    const countsByStatus = await db
      .select({
        status: platformTenants.status,
        count: sql<number>`count(*)::int`,
      })
      .from(platformTenants)
      .groupBy(platformTenants.status)

    const statusCounts: Record<string, number> = {}
    for (const row of countsByStatus) {
      statusCounts[row.status] = Number(row.count)
    }

    let tenants: any[] | undefined

    if (withList) {
      const tenantRows = await db
        .select({
          id: platformTenants.id,
          legalName: platformTenants.legalName,
          tradeName: platformTenants.tradeName,
          slug: platformTenants.slug,
          businessType: platformTenants.businessType,
          status: platformTenants.status,
          countryCode: platformTenants.countryCode,
          phone: platformTenants.phone,
          createdAt: platformTenants.createdAt,
        })
        .from(platformTenants)
        .where(whereClause ?? undefined)
        .orderBy(desc(platformTenants.createdAt))
        .limit(limit)

      const tenantBrandingRows = await db
        .select({
          tenantId: tenantBranding.tenantId,
          logoUrl: tenantBranding.logoUrl,
          primaryColor: tenantBranding.primaryColor,
        })
        .from(tenantBranding)
        .where(
          inArray(
            tenantBranding.tenantId,
            tenantRows.map((t) => t.id)
          )
        )

      const brandingMap: Record<string, { logoUrl?: string | null; primaryColor?: string | null }> = {}
      for (const b of tenantBrandingRows) {
        brandingMap[b.tenantId] = { logoUrl: b.logoUrl, primaryColor: b.primaryColor }
      }

      const ownerRows = await db
        .select({
          tenantId: platformMemberships.tenantId,
          ownerName: platformUsers.name,
          ownerEmail: platformUsers.email,
        })
        .from(platformMemberships)
        .innerJoin(platformUsers, eq(platformMemberships.userId, platformUsers.id))
        .where(
          and(
            eq(platformMemberships.role, 'owner'),
            inArray(platformMemberships.tenantId, tenantRows.map((t) => t.id))
          )
        )

      const ownerMap: Record<string, { name: string; email: string }> = {}
      for (const o of ownerRows) {
        if (o.tenantId) {
          ownerMap[o.tenantId] = { name: o.ownerName, email: o.ownerEmail }
        }
      }

      tenants = tenantRows.map((t) => ({
        ...t,
        branding: brandingMap[t.id] ?? null,
        owner: ownerMap[t.id] ?? null,
      }))
    }

    return NextResponse.json({
      data: {
        total: Number(totalCountRow?.count ?? 0),
        countsByStatus: statusCounts,
        tenants,
      },
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
