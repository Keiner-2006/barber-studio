import { Customer } from '../../domain/entities/Customer'

export interface CreateCustomerData {
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  document?: string | null
  notes?: string | null
}

export interface UpdateCustomerData {
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  document?: string | null
  notes?: string | null
}

export interface SearchCustomerFilters {
  query?: string
  cursor?: string
  limit?: number
}

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>
  create(data: CreateCustomerData): Promise<Customer>
  update(id: string, data: UpdateCustomerData): Promise<Customer | null>
  delete(id: string): Promise<Customer | null>
  search(filters: SearchCustomerFilters): Promise<Customer[]>
}