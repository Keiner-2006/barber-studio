import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { ServiceRegistry } from '@/shared/container/ServiceRegistry'
import { createProductSchema, inventoryAdjustmentSchema } from '@/modules/inventory/presentation/schemas/inventory.schema'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search') || undefined
      const products = await ServiceRegistry.inventory.listProducts.execute({ search })
      const totalValue = products.reduce((sum, p) => sum + Number(p.unitCost || 0), 0)
      return NextResponse.json({ data: products.map(p => p.toPlain()), totalValue })
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
      const parsed = createProductSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const existing = await ServiceRegistry.inventoryAdapter.findProductBySku(parsed.data.sku)
      if (existing) {
        return NextResponse.json(
          { error: { code: 'CONFLICT', message: 'Ya existe un producto con ese SKU' }, requestId },
          { status: 409 }
        )
      }

      const product = await ServiceRegistry.inventoryAdapter.createProduct(parsed.data)
      return NextResponse.json({ data: product.toPlain() }, { status: 201 })
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
