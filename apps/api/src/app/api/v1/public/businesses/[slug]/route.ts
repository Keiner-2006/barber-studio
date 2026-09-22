import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'
import { getPlatformDb } from '@/shared/db'
import { platformTenants, tenantBranding } from '@/shared/db/schema/platform-schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const params = await context.params
  const requestId = generateRequestId()
  try {
    const platformDb = getPlatformDb()

    const [tenant] = await platformDb
      .select()
      .from(platformTenants)
      .where(eq(platformTenants.slug, params.slug))
      .limit(1)

    if (!tenant) {
      throw new AppError('NOT_FOUND', 'Negocio no encontrado')
    }

    if (tenant.status !== 'active') {
      throw new AppError('FORBIDDEN', 'Negocio no disponible')
    }

    const [branding] = await platformDb
      .select()
      .from(tenantBranding)
      .where(eq(tenantBranding.tenantId, tenant.id))
      .limit(1)

    return NextResponse.json({
      data: {
        id: tenant.id,
        slug: tenant.slug,
        tradeName: tenant.tradeName,
        legalName: tenant.legalName,
        businessType: tenant.businessType,
        phone: tenant.phone,
        status: tenant.status,
        branding: branding ? {
          logoUrl: branding.logoUrl,
          coverImageUrl: branding.coverImageUrl,
          galleryUrls: branding.galleryUrls,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          accentColor: branding.accentColor,
          description: branding.description,
          socialLinks: branding.socialLinks,
          publicBookingEnabled: branding.publicBookingEnabled,
        } : null,
        createdAt: tenant.createdAt,
      },
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
