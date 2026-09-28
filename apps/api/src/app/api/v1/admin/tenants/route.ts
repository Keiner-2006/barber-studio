import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'
import { ProvisioningService } from '@/shared/provisioning/provisioning.service'
import { getPlatformDb } from '@/shared/db'
import {
  platformUsers,
  platformMemberships,
  platformTenants,
  tenantBranding,
} from '@/shared/db/schema/platform-schema'
import { eq, and, sql, desc, inArray } from 'drizzle-orm'
import { z } from 'zod'

const service = new ProvisioningService()

const createTenantSchema = z.object({
  legalName: z.string().min(1).max(200),
  tradeName: z.string().min(1).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  businessType: z.enum(['barberia', 'peluqueria', 'grooming', 'otro']),
  email: z.string().email(),
  ownerName: z.string().min(1).max(200),
  ownerLastName: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  countryCode: z.string().length(2).optional().default('CO'),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  primaryColor: z.string().optional(),
})

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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const parsed = createTenantSchema.safeParse(body)
    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR', 'Datos inválidos', parsed.error.issues as unknown as Record<string, unknown>)
    }

    const { legalName, tradeName, slug, businessType, email, ownerName, ownerLastName, phone, countryCode, documentType, documentNumber, primaryColor } = parsed.data

    const existingTenant = await service.getTenantBySlug(slug)
    if (existingTenant) {
      throw new AppError('CONFLICT', 'Ya existe un negocio con ese slug')
    }

    const result = await service.createTenantAndJob({
      legalName,
      tradeName,
      slug,
      businessType,
      countryCode: countryCode || 'CO',
      email,
      ownerName,
      ownerLastName,
      phone,
      documentType,
      documentNumber,
      primaryColor,
    })

    return NextResponse.json({ data: result, requestId }, { status: 201 })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
