import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { getTenantId } from '@/shared/tenancy/request-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { purchaseOrderRepository } from '@/modules/purchasing/infrastructure/repositories/purchase-order.repository'
import { z } from 'zod'

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'ordered', 'received', 'cancelled']),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const order = await purchaseOrderRepository.findById(id)
      if (!order) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Orden no encontrada' }, requestId }, { status: 404 })
      }
      return NextResponse.json({ data: order })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const body = await request.json()
      const parsed = updateStatusSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
      }
      const order = await purchaseOrderRepository.updateStatus(id, parsed.data.status)
      if (!order) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Orden no encontrada' }, requestId }, { status: 404 })
      }
      return NextResponse.json({ data: order })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const order = await purchaseOrderRepository.updateStatus(id, 'cancelled')
      if (!order) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Orden no encontrada' }, requestId }, { status: 404 })
      }
      return NextResponse.json({ data: order })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
