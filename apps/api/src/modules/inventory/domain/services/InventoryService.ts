import { Product } from '../entities/Product'
import { BranchInventory } from '../entities/BranchInventory'

export class InventoryService {
  /**
   * Verifica si un producto tiene stock bajo
   */
  isLowStock(product: Product, currentStock: number): boolean {
    return currentStock <= product.minQuantity
  }

  /**
   * Calcula el valor total del inventario
   */
  calculateTotalValue(products: Product[], stockLevels: Map<string, number>): number {
    let total = 0
    products.forEach((product) => {
      const stock = stockLevels.get(product.id) || 0
      total += stock * product.unitCostNumber
    })
    return total
  }

  /**
   * Calcula el valor de un producto específico
   */
  calculateProductValue(product: Product, quantity: number): number {
    return quantity * product.unitCostNumber
  }

  /**
   * Verifica si se puede realizar una transferencia
   */
  canTransfer(fromStock: number, quantity: number): boolean {
    return fromStock >= quantity
  }

  /**
   * Calcula el punto de reordenamiento
   */
  calculateReorderPoint(dailyUsage: number, leadTimeDays: number, minQuantity: number): number {
    return Math.max(Math.ceil(dailyUsage * leadTimeDays), minQuantity)
  }

  /**
   * Calcula el margen de ganancia
   */
  calculateMargin(product: Product): number {
    if (!product.suggestedPrice) return 0
    const suggested = parseFloat(product.suggestedPrice)
    const cost = product.unitCostNumber
    return ((suggested - cost) / cost) * 100
  }

  /**
   * Agrupa productos por categoría
   */
  groupByCategory(products: Product[]): Map<string, Product[]> {
    const grouped = new Map<string, Product[]>()
    products.forEach((product) => {
      const category = product.category || 'Sin categoría'
      const existing = grouped.get(category) || []
      existing.push(product)
      grouped.set(category, existing)
    })
    return grouped
  }
}