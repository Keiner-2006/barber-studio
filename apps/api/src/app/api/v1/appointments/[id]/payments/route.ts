import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { appointmentRepository } from '@/modules/appointments/infrastructure/repositories/appointment.repository'
import { z } from 'zod'

const createPaymentSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.string(),
  currency: z.string().length(3),
  method: z.enum(['cash', 'card_manual', 'transfer_manual', 'other']),
  reference: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const payments = await appointmentRepository.getPaymentsForAppointment(id)
      return NextResponse.json({ data: payments })
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const body = await request.json()
      const parsed = createPaymentSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }
      const payment = await appointmentRepository.createPayment({
        ...parsed.data,
        recordedBy: undefined,
      })
      return NextResponse.json({ data: payment }, { status: 201 })
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
