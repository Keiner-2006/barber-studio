import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { AppError } from '@/shared/errors/app-error'
import crypto from 'node:crypto'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''

function getCloudinaryParams(): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000)
  const params: Record<string, string> = {
    api_key: CLOUDINARY_API_KEY,
    timestamp: String(timestamp),
  }
  const stringToSign = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  const signature = crypto.createHmac('sha256', CLOUDINARY_API_SECRET).update(stringToSign).digest('hex')
  return { ...params, signature }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new AppError('INTERNAL_ERROR', 'Cloudinary no configurado')
    }

    const body = await request.json()
    const { type = 'image', resourceType = 'auto' } = body || {}

    const params = getCloudinaryParams()
    params['folder'] = 'navaja-studio'
    params['use_filename'] = 'true'
    params['unique_filename'] = 'true'

    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'navaja_upload'
    params['upload_preset'] = uploadPreset

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`

    return NextResponse.json({
      data: {
        uploadUrl,
        params,
        cloudName: CLOUDINARY_CLOUD_NAME,
      },
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      throw new AppError('VALIDATION_ERROR', 'assetId es requerido')
    }

    const { searchParams: sp } = new URL(request.url)
    const publicId = sp.get('publicId') || assetId

    const params = getCloudinaryParams()
    params['public_id'] = publicId
    params['type'] = 'upload'

    const destroyUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`

    return NextResponse.json({
      data: {
        destroyUrl,
        params,
      },
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
