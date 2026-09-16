import { ICustomerRepository, SearchCustomerFilters } from '../ports/ICustomerRepository'
import { Customer } from '../../domain/entities/Customer'

export interface SearchCustomersRequest {
  query?: string
  cursor?: string
  limit?: number
}

export class SearchCustomersUseCase {
  constructor(private readonly repository: ICustomerRepository) {}

  async execute(request: SearchCustomersRequest): Promise<Customer[]> {
    if (request.limit && (request.limit < 1 || request.limit > 100)) {
      throw new Error('Limit must be between 1 and 100')
    }

    const filters: SearchCustomerFilters = {
      query: request.query,
      cursor: request.cursor,
      limit: request.limit,
    }

    return this.repository.search(filters)
  }
}