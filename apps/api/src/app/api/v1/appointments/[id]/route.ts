import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { appointmentRepository } from '@/modules/appointments/infrastructure/repositories/appointment.repository'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

      const body = await request.json()
      const { action, reason } = body
      const updated = await appointmentRepository.updateStatus(id, action, reason)
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
