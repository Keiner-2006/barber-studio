import { Branch, TenantInfo } from '../../core/tenancy/tenant.models'

export interface FullBranch extends Branch {
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
  operatingHours?: Record<string, unknown>
}

export interface StaffMember {
  id: string
  userId: string
  displayName: string
  email?: string
  bio?: string
  avatarUrl?: string
  commissionRate: string
  isBookable: boolean
  status: string
  userEmail?: string
}

export interface CreateBranch {
  code: string
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  timezone?: string
  operatingHours?: Record<string, unknown>
}

export interface SettingsTenantView {
  name: string
  slug: string
  currencyCode: string
  countryCode: string
  timezone: string
}

export interface SettingsState {
  tenant: TenantInfo | null
  branches: FullBranch[]
  staff: StaffMember[]
}
