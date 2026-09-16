import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { ServiceRegistry } from '@/shared/container/ServiceRegistry'
import { z } from 'zod'

const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  branchId: z.string().uuid(),
  expectedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantityOrdered: z.number().int().positive(),
    unitCost: z.string(),
  })).min(1),
})

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status') || undefined
      const branchId = searchParams.get('branchId') || undefined
      const orders = await ServiceRegistry.purchasingAdapter.listOrders({ status, branchId })
      return NextResponse.json({ data: orders })
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

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const body = await request.json()
      const parsed = createPurchaseOrderSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId }, { status: 400 })
      }
      const order = await ServiceRegistry.purchasingAdapter.createOrder(parsed.data)
      return NextResponse.json({ data: order }, { status: 201 })
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
