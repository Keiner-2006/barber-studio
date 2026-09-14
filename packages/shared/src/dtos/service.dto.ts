import type { PaymentPolicy, DepositType } from '../enums/tenant.enum'

export type CreateServiceCategoryDTO = {
  name: string
  description?: string
  displayOrder?: number
}

export type UpdateServiceCategoryDTO = {
  name?: string
  description?: string
  displayOrder?: number
  active?: boolean
}

export type ServiceCategoryResponseDTO = {
  id: string
  name: string
  description?: string
  displayOrder: number
  active: boolean
}

export type CreateServiceDTO = {
  categoryId: string
  name: string
  description?: string
  durationMinutes: number
  priceBase: string
  currency: string
  paymentPolicy: PaymentPolicy
  depositType?: DepositType
  depositValue?: string
  cancellationMinutes?: number
}

export type UpdateServiceDTO = {
  categoryId?: string
  name?: string
  description?: string
  durationMinutes?: number
  priceBase?: string
  paymentPolicy?: PaymentPolicy
  depositType?: DepositType
  depositValue?: string
  cancellationMinutes?: number
  active?: boolean
}

export type ServiceResponseDTO = {
  id: string
  categoryId: string
  categoryName: string
  name: string
  description?: string
  durationMinutes: number
  priceBase: string
  currency: string
  paymentPolicy: PaymentPolicy
  depositType?: DepositType
  depositValue?: string
  cancellationMinutes?: number
  active: boolean
}

export type BranchServiceDTO = {
  serviceId: string
  branchId: string
  priceOverride?: string
  durationOverride?: number
  active: boolean
}
