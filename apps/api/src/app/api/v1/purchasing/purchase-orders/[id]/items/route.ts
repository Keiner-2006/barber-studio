import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { getTenantId } from '@/shared/tenancy/request-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { purchaseOrderRepository } from '@/modules/purchasing/infrastructure/repositories/purchase-order.repository'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const items = await purchaseOrderRepository.getItems(id)
      return NextResponse.json({ data: items })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const body = await request.json()

      if (body.action === 'add-items') {
        const items = body.items as { productId: string; quantityOrdered: number; unitCost: string }[]
        const result = await purchaseOrderRepository.addItems(id, items)
        return NextResponse.json({ data: result })
      }

      if (body.action === 'receive') {
        const receipt = await purchaseOrderRepository.receiveOrder(id, body.receivedBy || 'unknown')
        if (!receipt) {
          return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Orden no encontrada' }, requestId }, { status: 404 })
        }
        return NextResponse.json({ data: receipt })
      }

      if (body.action === 'receipt') {
        const data = {
          orderId: id,
          receivedBy: body.receivedBy || 'unknown',
          items: body.items as { productId: string; quantityReceived: number }[],
          notes: body.notes,
        }
        const receipt = await purchaseOrderRepository.createReceipt(data)
        return NextResponse.json({ data: receipt }, { status: 201 })
      }

      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Acción no válida' }, requestId }, { status: 400 })
    })
    if (!result) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId }, { status: 401 })
    }
    return result
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
