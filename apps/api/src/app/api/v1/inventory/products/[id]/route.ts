import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { inventoryRepository } from '@/modules/inventory/infrastructure/repositories/inventory.repository'
import { updateProductSchema } from '@/modules/inventory/presentation/schemas/inventory.schema'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const body = await request.json()
      const parsed = updateProductSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }
      const product = await inventoryRepository.updateProduct(id, parsed.data)
      if (!product) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }, requestId },
          { status: 404 }
        )
      }
      return NextResponse.json({ data: product })
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async () => {
      const { id } = await params
      const product = await inventoryRepository.findProductById(id)
      if (!product) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }, requestId },
          { status: 404 }
        )
      }
      const deleted = await inventoryRepository.deleteProduct(id)
      return NextResponse.json({ data: deleted })
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
