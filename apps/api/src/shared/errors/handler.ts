import { NextResponse } from 'next/server'
import { AppError, type ApiErrorResponse } from './app-error'

export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    const response: ApiErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      requestId,
    }
    return NextResponse.json(response, { status: error.statusCode })
  }

  console.error('Unexpected error:', error)

  const response: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
    },
    requestId,
  }
  return NextResponse.json(response, { status: 500 })
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
