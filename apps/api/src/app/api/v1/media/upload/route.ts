import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'navaja_upload'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new AppError('INTERNAL_ERROR', 'Cloudinary no configurado')
    }

    const body = await request.json().catch(() => ({}))
    const { folder = 'navaja-studio' } = body || {}

    return NextResponse.json({
      data: {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        folder,
      },
      requestId,
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
