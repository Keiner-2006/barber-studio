export interface ServiceCategory {
  id: string
  name: string
  description?: string
  displayOrder: number
  active: boolean
}

export interface Service {
  id: string
  categoryId: string
  name: string
  description?: string
  durationMinutes: number
  priceBase: string
  currency: string
  paymentPolicy: 'none' | 'deposit' | 'full'
  depositType?: 'fixed' | 'percentage'
  depositValue?: string
  cancellationMinutes?: number
  active: boolean
}

export interface CreateService {
  categoryId: string
  name: string
  description?: string
  durationMinutes: number
  priceBase: string
  currency?: string
  paymentPolicy?: 'none' | 'deposit' | 'full'
  depositType?: 'fixed' | 'percentage'
  depositValue?: string
  cancellationMinutes?: number
}

export interface CreateServiceCategory {
  name: string
  description?: string
  displayOrder?: number
}
