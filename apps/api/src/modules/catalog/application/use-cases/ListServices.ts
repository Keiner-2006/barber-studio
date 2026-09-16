import { ICatalogRepository } from '../ports/ICatalogRepository'
import { Service } from '../../domain/entities/Service'

export interface ListServicesRequest {
  categoryId?: string
}

export class ListServicesUseCase {
  constructor(private readonly repository: ICatalogRepository) {}

  async execute(request: ListServicesRequest): Promise<Service[]> {
    return this.repository.listServices(request.categoryId)
  }
}