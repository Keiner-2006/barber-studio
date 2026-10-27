export interface Customer {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  document?: string
  notes?: string
  birthDate?: string
  marketingConsent: boolean
  totalVisits: number
  totalSpent: string
  currency: string
  lastVisitAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CustomerSearch {
  query?: string
  cursor?: string
  limit?: number
}

export interface CreateCustomer {
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  document?: string
  notes?: string
  birthDate?: string
  marketingConsent?: boolean
}
