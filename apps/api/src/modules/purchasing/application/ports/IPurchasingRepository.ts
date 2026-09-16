import { Supplier } from '../../domain/entities/Supplier'

export interface CreateSupplierData {
  name: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  notes?: string | null
}

export interface UpdateSupplierData {
  name?: string
  contactName?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  notes?: string | null
  active?: boolean
}

export interface IPurchasingRepository {
  findSupplierById(id: string): Promise<Supplier | null>
  findSupplierByName(name: string): Promise<Supplier | null>
  listSuppliers(): Promise<Supplier[]>
  createSupplier(data: CreateSupplierData): Promise<Supplier>
  updateSupplier(id: string, data: UpdateSupplierData): Promise<Supplier | null>
  deactivateSupplier(id: string): Promise<Supplier | null>
  
  // Purchase Orders
  findOrderById(id: string): Promise<any | null>
  listOrders(filters?: { status?: string; branchId?: string }): Promise<any[]>
  createOrder(data: { supplierId: string; branchId: string; expectedDate?: string; notes?: string; items: { productId: string; quantityOrdered: number; unitCost: string }[] }): Promise<any>
  updateOrderStatus(id: string, status: string): Promise<any | null>
  addOrderItems(orderId: string, items: { productId: string; quantityOrdered: number; unitCost: string }[]): Promise<any[]>
  getOrderItems(orderId: string): Promise<any[]>
  receiveOrder(orderId: string, receivedBy: string): Promise<any | null>
  createReceipt(data: { orderId: string; receivedBy: string; items: { productId: string; quantityReceived: number }[]; notes?: string }): Promise<any>
}