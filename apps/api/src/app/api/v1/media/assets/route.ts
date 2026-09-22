import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'
import { getPlatformDb } from '@/shared/db'
import { tenantMediaAssets } from '@/shared/db/schema/platform-schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()
    const { tenantId, providerAssetId, url, secureUrl, resourceType, width, height, altText, purpose } = body

    if (!tenantId || !providerAssetId || !url || !purpose) {
      throw new AppError('VALIDATION_ERROR', 'Faltan campos requeridos: tenantId, providerAssetId, url, purpose')
    }

    const platformDb = getPlatformDb()
    const assetId = randomUUID()

    await platformDb.insert(tenantMediaAssets).values({
      id: assetId,
      tenantId,
      provider: 'cloudinary',
      providerAssetId,
      url,
      secureUrl: secureUrl || url,
      resourceType: resourceType || 'image',
      width: width || null,
      height: height || null,
      altText: altText || null,
      purpose,
    })

    return NextResponse.json({ data: { id: assetId, tenantId, providerAssetId, url }, requestId }, { status: 201 })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const purpose = searchParams.get('purpose')

    const platformDb = getPlatformDb()

    const conditions: Record<string, unknown> = {}
    if (tenantId) conditions.tenantId = tenantId
    if (purpose) conditions.purpose = purpose

    const assets = await platformDb.query.tenantMediaAssets.findMany({
      where: tenantId ? eq(tenantMediaAssets.tenantId, tenantId) : undefined,
      limit: 100,
    })

    return NextResponse.json({
      data: assets.map((a) => ({
        id: a.id,
        tenantId: a.tenantId,
        provider: a.provider,
        url: a.url,
        secureUrl: a.secureUrl,
        resourceType: a.resourceType,
        width: a.width,
        height: a.height,
        altText: a.altText,
        purpose: a.purpose,
        createdAt: a.createdAt,
      })),
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
