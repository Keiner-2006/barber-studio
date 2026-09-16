import { ServiceCategory } from '../../domain/entities/ServiceCategory'
import { Service } from '../../domain/entities/Service'

export interface CreateServiceCategoryData {
  name: string
  description?: string | null
  displayOrder?: number
}

export interface UpdateServiceCategoryData {
  name?: string
  description?: string | null
  displayOrder?: number
  active?: boolean
}

export interface CreateServiceData {
  categoryId: string
  name: string
  description?: string | null
  durationMinutes: number
  priceBase: string
  currency?: string
  paymentPolicy?: 'none' | 'deposit' | 'full'
  depositType?: 'fixed' | 'percentage' | null
  depositValue?: string | null
  cancellationMinutes?: number | null
}

export interface UpdateServiceData {
  categoryId?: string
  name?: string
  description?: string | null
  durationMinutes?: number
  priceBase?: string
  paymentPolicy?: 'none' | 'deposit' | 'full'
  depositType?: 'fixed' | 'percentage' | null
  depositValue?: string | null
  cancellationMinutes?: number | null
  active?: boolean
}

export interface ICatalogRepository {
  // Categorías
  findCategoryById(id: string): Promise<ServiceCategory | null>
  createCategory(data: CreateServiceCategoryData): Promise<ServiceCategory>
  updateCategory(id: string, data: UpdateServiceCategoryData): Promise<ServiceCategory | null>
  deleteCategory(id: string): Promise<ServiceCategory | null>
  listCategories(): Promise<ServiceCategory[]>
  
  // Servicios
  findServiceById(id: string): Promise<Service | null>
  createService(data: CreateServiceData): Promise<Service>
  updateService(id: string, data: UpdateServiceData): Promise<Service | null>
  deleteService(id: string): Promise<Service | null>
  listServices(categoryId?: string): Promise<Service[]>
  getBranchServices(branchId: string): Promise<any[]>
}