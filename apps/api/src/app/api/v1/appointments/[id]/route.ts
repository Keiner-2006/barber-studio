import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { appointmentRepository } from '@/modules/appointments/infrastructure/repositories/appointment.repository'

const ACTION_MAP: Record<string, string> = {
  confirm: 'confirmed',
  'check-in': 'checked_in',
  start: 'in_service',
  complete: 'completed',
  cancel: 'cancelled',
  'no-show': 'no_show',
}

async function handleAction(request: NextRequest, { params }: { params: Promise<{ id: string }> }, action: string) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const appointment = await appointmentRepository.findById(id)
      if (!appointment) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Reserva no encontrada' }, requestId },
          { status: 404 }
        )
      }

      const status = ACTION_MAP[action]
      const body = await request.json()
      const reason = body.reason || null
      const updated = await appointmentRepository.updateStatus(id, status, reason)
      return NextResponse.json({ data: updated })
    })
    if (!result) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId },
        { status: 401 }
      )
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json()
  const action = body.action
  if (ACTION_MAP[action]) {
    return handleAction(request, { params }, action)
  }
  return handleAction(request, { params }, action)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  if (action && ACTION_MAP[action]) {
    return handleAction(request, { params }, action)
  }
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Action requerida: confirm, check-in, start, complete, cancel, no-show' } },
    { status: 400 }
  )
}
