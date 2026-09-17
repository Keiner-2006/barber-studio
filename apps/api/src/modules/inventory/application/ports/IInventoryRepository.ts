import { Product } from '../../domain/entities/Product'

export interface CreateProductData {
  name: string
  sku: string
  description?: string | null
  category?: string | null
  unit?: string
  unitCost: string
  suggestedPrice?: string | null
  minQuantity?: number
}

export interface UpdateProductData {
  name?: string
  description?: string | null
  category?: string | null
  unit?: string
  unitCost?: string
  suggestedPrice?: string | null
  minQuantity?: number
  active?: boolean
}

export interface InventoryAdjustmentData {
  productId: string
  branchId: string
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'consumption' | 'return'
  quantity: string
  unitCost?: string
  reference?: string
  notes?: string
}

export interface IInventoryRepository {
  findProductById(id: string): Promise<Product | null>
  findProductBySku(sku: string): Promise<Product | null>
  createProduct(data: CreateProductData): Promise<Product>
  updateProduct(id: string, data: UpdateProductData): Promise<Product | null>
  deleteProduct(id: string): Promise<Product | null>
  listProducts(search?: string): Promise<Product[]>
  getBranchInventory(branchId: string): Promise<any[]>
  getLowStockItems(branchId: string): Promise<any[]>
  createMovement(data: InventoryAdjustmentData): Promise<any>
  updateStock(branchId: string, productId: string, quantityChange: string): Promise<any>
}