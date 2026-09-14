import type { InventoryMovementType } from '../enums/inventory-movement-type.enum'

export type CreateProductDTO = {
  name: string
  sku: string
  description?: string
  category?: string
  unit?: string
  unitCost: string
  suggestedPrice?: string
  minQuantity?: number
}

export type UpdateProductDTO = {
  name?: string
  description?: string
  category?: string
  unit?: string
  unitCost?: string
  suggestedPrice?: string
  minQuantity?: number
  active?: boolean
}

export type ProductResponseDTO = {
  id: string
  name: string
  sku: string
  description?: string
  category?: string
  unit?: string
  unitCost: string
  suggestedPrice?: string
  minQuantity: number
  active: boolean
}

export type BranchInventoryDTO = {
  productId: string
  branchId: string
  quantity: string
  reserved: string
  averageCost: string
}

export type InventoryAdjustmentDTO = {
  productId: string
  branchId: string
  type: InventoryMovementType
  quantity: string
  unitCost?: string
  reference?: string
  notes?: string
}

export type InventoryTransferDTO = {
  productId: string
  fromBranchId: string
  toBranchId: string
  quantity: string
  notes?: string
}

export type InventoryMovementResponseDTO = {
  id: string
  productId: string
  productName: string
  productSku: string
  branchId: string
  branchName: string
  type: InventoryMovementType
  quantity: string
  unitCost: string
  reference?: string
  actorName: string
  createdAt: string
}
