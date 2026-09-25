import { NextRequest, NextResponse } from 'next/server'
import { signIn, demoAuthEnabled, demoUser } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { resolveUserRole, validateRoleForFlow, getRoleCategory } from '@/shared/auth/role-resolver'

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
    const { email, password, expectedRole, tenantId } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email y contraseña son requeridos' }, requestId },
        { status: 400 }
      )
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
