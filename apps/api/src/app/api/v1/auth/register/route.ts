import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email, contraseña y nombre son requeridos' }, requestId },
        { status: 400 }
      )
    }

    const result = await signUp(
      { email, password, name },
      request.headers
    )

    return NextResponse.json({
      user: result.user,
      session: {
        token: result.token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    }, { status: 201 })
  } catch (error: any) {
    if (error.message?.includes('already')) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'El email ya está registrado' }, requestId },
        { status: 409 }
      )
    }
    return handleApiError(error, requestId)
  }
}
