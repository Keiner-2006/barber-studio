import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { inventoryRepository } from '@/modules/inventory/infrastructure/repositories/inventory.repository'
import { inventoryAdjustmentSchema } from '@/modules/inventory/presentation/schemas/inventory.schema'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const result = await withTenantRequest(request.headers, async ({ context }) => {
      const body = await request.json()
      const parsed = inventoryAdjustmentSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() }, requestId },
          { status: 400 }
        )
      }

      const movement = await inventoryRepository.createMovement({ ...parsed.data, actorId: context.userId })
      const currentInventory = await inventoryRepository.getBranchInventory(parsed.data.branchId)
      const current = currentInventory.find(i => i.branch_inventory.productId === parsed.data.productId)
      const currentQty = current ? parseFloat(current.branch_inventory.quantity) : 0
      const changeQty = parseFloat(parsed.data.quantity)
      const newQty = parsed.data.type === 'sale' || parsed.data.type === 'consumption' || parsed.data.type === 'transfer_out'
        ? currentQty - changeQty
        : currentQty + changeQty

      await inventoryRepository.updateStock(parsed.data.branchId, parsed.data.productId, newQty.toString())
      return NextResponse.json({ data: movement }, { status: 201 })
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
