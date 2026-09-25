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

  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`[ERROR] ${requestId}:`, error)

  const response: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: errorMessage,
      details: { rawError: errorMessage, stack: error instanceof Error ? error.stack : undefined },
    },
    requestId,
  }
  return NextResponse.json(response, { status: 500 })
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
