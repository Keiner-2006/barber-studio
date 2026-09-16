export interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  contactName?: string
  active?: boolean
}

export interface PurchaseOrder {
  id: string
  tenantId: string
  supplierId: string
  supplierName: string
  branchId: string
  status: 'draft' | 'pending' | 'ordered' | 'received' | 'cancelled'
  expectedDate?: string
  notes?: string
  createdBy: string
  total: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  purchaseOrderId: string
  productId: string
  productName: string
  quantity: number
  unitCost: string
  totalCost: string
}

export interface CreatePurchaseOrder {
  supplierId: string
  branchId: string
  expectedDate?: string
  notes?: string
  items: { productId: string; quantityOrdered: number; unitCost: string }[]
}

export interface OrderItemInput {
  productId: string
  quantityOrdered: number
  unitCost: string
}

export type PurchaseTab = 'suppliers' | 'orders'
