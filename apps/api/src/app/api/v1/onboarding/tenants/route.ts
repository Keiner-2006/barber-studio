import { NextRequest, NextResponse } from 'next/server'
import { ProvisioningService } from '@/shared/provisioning/provisioning.service'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'
import { randomUUID } from 'node:crypto'
import { getPlatformDb } from '@/shared/db'
import { platformTenants } from '@/shared/db/schema/platform-schema'
import { eq } from 'drizzle-orm'

const service = new ProvisioningService()

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()
    const { account, business, location, branding } = body

    const { legalName, tradeName, slug, businessType, email, ownerName, ownerLastName, phone, documentType, documentNumber, birthDate, city } = {
      legalName: business?.legalName ?? body.legalName,
      tradeName: business?.tradeName ?? body.tradeName,
      slug: business?.slug ?? body.slug,
      businessType: business?.businessType ?? body.businessType,
      email: account?.email ?? body.email,
      ownerName: account?.name ?? body.ownerName,
      ownerLastName: account?.lastName ?? body.ownerLastName,
      phone: account?.phone ?? location?.whatsapp ?? body.phone,
      documentType: account?.documentType ?? body.documentType,
      documentNumber: account?.documentNumber ?? body.documentNumber,
      birthDate: account?.birthDate ?? body.birthDate,
      city: account?.city ?? body.city,
    }

    if (!legalName || !tradeName || !slug || !email || !ownerName) {
      throw new AppError('VALIDATION_ERROR', 'Faltan campos requeridos: legalName, tradeName, slug, email, ownerName')
    }

    const result = await service.createTenantAndJob({
      legalName,
      tradeName,
      slug,
      businessType,
      email,
      ownerName,
      ownerLastName,
      phone,
      documentType,
      documentNumber,
      birthDate,
      city,
      logoUrl: branding?.logoUrl,
      primaryColor: branding?.primaryColor,
    })

    return NextResponse.json({ data: result, requestId }, { status: 201 })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      throw new AppError('VALIDATION_ERROR', 'Se requiere el query parameter slug')
    }

    const tenant = await service.getTenantBySlug(slug)
    if (!tenant) {
      throw new AppError('NOT_FOUND', 'Negocio no encontrado')
    }

    return NextResponse.json({
      data: {
        id: tenant.id,
        slug: tenant.slug,
        tradeName: tenant.tradeName,
        legalName: tenant.legalName,
        businessType: tenant.businessType,
        status: tenant.status,
        phone: tenant.phone,
        countryCode: tenant.countryCode,
        timezone: tenant.timezone,
        currencyCode: tenant.currencyCode,
        createdAt: tenant.createdAt,
      },
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
