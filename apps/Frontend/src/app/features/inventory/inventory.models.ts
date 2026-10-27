export interface Product {
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

export interface CreateProduct {
  name: string
  sku: string
  description?: string
  category?: string
  unit?: string
  unitCost: string
  suggestedPrice?: string
  minQuantity?: number
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  productSku: string
  branchId: string
  branchName: string
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'consumption' | 'return'
  quantity: string
  unitCost: string
  reference?: string
  actorName: string
  createdAt: string
}

export interface BranchStock {
  productId: string
  branchId: string
  quantity: number
  reserved: number
  averageCost: string
}
