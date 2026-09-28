import { NextRequest, NextResponse } from 'next/server'
import { signIn, demoAuthEnabled, demoUser } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { resolveUserRole, validateRoleForFlow, getRoleCategory } from '@/shared/auth/role-resolver'
import { checkLoginRateLimit, resetLoginRateLimit } from '@/shared/http/rate-limit'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
  expectedRole: z.enum(['admin', 'company_member', 'owner', 'customer', 'client', 'platform_admin', 'platform_support']).optional(),
  tenantId: z.string().uuid('Tenant ID inválido').optional(),
})

const COMPANY_MEMBER_FLOWS = ['company_member', 'staff', 'admin']
const CUSTOMER_FLOWS = ['customer', 'client']
const PLATFORM_MEMBER_FLOWS = ['platform_admin', 'platform_support']

function mapExpectedRoleToFlow(expectedRole: string): 'company_member' | 'customer' | 'platform_member' | null {
  if (COMPANY_MEMBER_FLOWS.includes(expectedRole.toLowerCase())) return 'company_member'
  if (CUSTOMER_FLOWS.includes(expectedRole.toLowerCase())) return 'customer'
  if (PLATFORM_MEMBER_FLOWS.includes(expectedRole.toLowerCase())) return 'platform_member'
  return null
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()

    let parsed: { email: string; password: string; expectedRole?: string; tenantId?: string }
    try {
      parsed = loginSchema.parse(body)
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

    const { email, password, expectedRole, tenantId } = parsed

    if (process.env.NODE_ENV !== 'development' && !demoAuthEnabled()) {
      const rateLimitKey = `${email}:${request.headers.get('x-forwarded-for') || 'unknown'}`
      if (!checkLoginRateLimit(rateLimitKey)) {
        return NextResponse.json(
          {
            error: {
              code: 'RATE_LIMITED',
              message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
            },
            requestId,
          },
          { status: 429, headers: { 'Retry-After': '900' } }
        )
      }
    }

    if (expectedRole) {
      const expectedFlow = mapExpectedRoleToFlow(expectedRole)
      if (!expectedFlow) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: `expectedRole inválido: ${expectedRole}. Use 'company_member' o 'customer'.`,
            },
            requestId,
          },
          { status: 400 }
        )
      }

      const identity = await resolveUserRole(email, tenantId)
      if (!identity.role) {
        return NextResponse.json(
          {
            error: {
              code: 'USER_NOT_FOUND',
              message: 'Usuario no encontrado',
            },
            requestId,
          },
          { status: 404 }
        )
      }

      if (!validateRoleForFlow(identity.role, expectedFlow)) {
        const targetType = expectedFlow === 'customer' ? 'cliente' : expectedFlow === 'platform_member' ? 'administrador de plataforma' : 'miembro de la empresa'
        return NextResponse.json(
          {
            error: {
              code: 'ROLE_MISMATCH',
              message: `Estas credenciales no corresponden a un ${targetType}. Utiliza el flujo de ${expectedFlow === 'customer' ? 'cliente' : expectedFlow === 'platform_member' ? 'plataforma' : 'administrador'}.`,
            },
            requestId,
          },
          { status: 403 }
        )
      }
    }

    const result = await signIn(
      { email, password },
      request.headers
    )

    if (process.env.NODE_ENV !== 'development' && !demoAuthEnabled()) {
      const rateLimitKey = `${email}:${request.headers.get('x-forwarded-for') || 'unknown'}`
      resetLoginRateLimit(rateLimitKey)
    }

    if (result.user) {
      const identity = await resolveUserRole(email, tenantId)
      if (identity.role) {
        ;(result.user as any).role = identity.role
      }
    }

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
