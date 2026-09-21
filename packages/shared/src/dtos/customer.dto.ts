export type CreateCustomerDTO = {
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  document?: string
  notes?: string
}

export type UpdateCustomerDTO = {
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  document?: string
  notes?: string
}

export type CustomerResponseDTO = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  document?: string
  totalVisits: number
  totalSpent: string
  currency: string
  lastVisitAt?: string
  createdAt: string
}

export type CustomerSearchQueryDTO = {
  query?: string
  cursor?: string
  limit?: number
}
