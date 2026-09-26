import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'navaja_upload'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new AppError('INTERNAL_ERROR', `Cloudinary no configurado. CLOUDINARY_CLOUD_NAME está vacío`)
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || process.env.CLOUDINARY_UPLOAD_FOLDER || 'barbershop_staging'

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

    return NextResponse.json({
      data: {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        uploadUrl,
        folder,
      },
      requestId,
    })
  } catch (error) {
    console.error(`[UPLOAD_ERROR] ${requestId}:`, error)
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new AppError('INTERNAL_ERROR', `Cloudinary no configurado. CLOUDINARY_CLOUD_NAME está vacío`)
    }

    const body = await request.json().catch(() => ({}))
    const { folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'barbershop_staging', tenantId, purpose } = body || {}

    if (!tenantId) {
      throw new AppError('VALIDATION_ERROR', 'tenantId es requerido', { field: 'tenantId' })
    }
    if (!purpose) {
      throw new AppError('VALIDATION_ERROR', 'purpose es requerido', { field: 'purpose' })
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

    return NextResponse.json({
      data: {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        uploadUrl,
        folder,
        tenantId,
        purpose,
      },
      requestId,
    })
  } catch (error) {
    console.error(`[UPLOAD_ERROR] ${requestId}:`, error)
    return handleApiError(error, requestId)
  }
}
