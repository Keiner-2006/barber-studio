export interface ReportFilters {
  from?: Date
  to?: Date
  branchId?: string
}

export interface ISalesReport {
  date: string
  totalSales: string
  totalOrders: number
  averageTicket: string
  currency: string
}

export interface IOccupancyReport {
  date: string
  totalSlots: number
  occupiedSlots: number
  occupancyRate: number
}

export interface IServiceReport {
  id: string
  name: string
  totalSales: string
  quantity: number
  currency: string
}

export interface IInventoryReport {
  id: string
  name: string
  sku: string
  currentStock: number
  minStock: number
  unitCost: string
  totalValue: string
  currency: string
}

export interface ICashReport {
  date: string
  sales: string
  expenses: string
  refunds: string
  net: string
  currency: string
}

export interface IReportsRepository {
  getSales(filters: ReportFilters): Promise<ISalesReport[]>
  getOccupancy(filters: ReportFilters): Promise<IOccupancyReport[]>
  getServices(filters: ReportFilters): Promise<IServiceReport[]>
  getInventory(branchId?: string): Promise<IInventoryReport[]>
  getCash(filters: ReportFilters): Promise<ICashReport[]>
}