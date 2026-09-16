export interface SalesReport {
  date: string
  totalSales: string
  totalOrders: number
  averageTicket: string
  currency: string
}

export interface OccupancyReport {
  date: string
  totalSlots: number
  occupiedSlots: number
  occupancyRate: number
}

export interface ServiceReport {
  id: string
  name: string
  totalSales: string
  quantity: number
  currency: string
}

export interface InventoryReport {
  id: string
  name: string
  sku: string
  currentStock: number
  minStock: number
  unitCost: string
  totalValue: string
  currency: string
}

export interface CashReport {
  date: string
  sales: string
  expenses: string
  refunds: string
  net: string
  currency: string
}

export interface AuditEvent {
  id: string
  action: string
  resource: string
  result: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export type ReportType = 'sales' | 'occupancy' | 'services' | 'inventory' | 'cash'
