import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(1, 'Nombre requerido').max(100, 'Nombre demasiado largo'),
  tenantId: z.string().uuid('Tenant ID inválido').optional(),
})

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()

    let parsed: { email: string; password: string; name: string; tenantId?: string }
    try {
      parsed = registerSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Datos de entrada inválidos',
              details: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
                code: issue.code,
              })),
            },
            requestId,
          },
          { status: 400 }
        )
      }
      throw error
    }

    const { email, password, name, tenantId } = parsed

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
