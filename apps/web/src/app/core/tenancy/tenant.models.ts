export type BranchStatus = 'active' | 'inactive'

export interface Branch {
  id: string
  name: string
  code: string
  status: BranchStatus
  timezone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  phone?: string
  operatingHours?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface TenantInfo {
  id: string
  name: string
  slug: string
  currencyCode: string
  countryCode: string
  timezone: string
}

export interface TenantMeResponse {
    data: {
        tenant: TenantInfo
        branches: Branch[]
    }
}

export interface BranchesResponse {
  data: Branch[]
}

export interface TenantState {
  tenant: TenantInfo | null
  branches: Branch[]
  currentBranch: Branch | null
}