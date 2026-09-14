import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email y contraseña son requeridos' }, requestId },
        { status: 400 }
      )
    }

    const result = await signIn(
      { email, password },
      request.headers
    )

    return NextResponse.json({
      user: result.user,
      session: {
        token: result.token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      redirect: result.redirect,
    })
  } catch (error: any) {
    if (error.message?.includes('Invalid')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Credenciales incorrectas' }, requestId },
        { status: 401 }
      )
    }
    return handleApiError(error, requestId)
  }
}
