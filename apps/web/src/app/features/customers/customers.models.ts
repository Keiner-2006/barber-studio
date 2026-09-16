export interface Customer {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  document?: string
  notes?: string
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
  email?: string
  phone?: string
  document?: string
  notes?: string
}
