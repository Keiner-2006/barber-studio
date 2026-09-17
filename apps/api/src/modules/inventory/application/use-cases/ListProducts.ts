import { IInventoryRepository } from '../ports/IInventoryRepository'
import { Product } from '../../domain/entities/Product'

export interface ListProductsRequest {
  active?: boolean
  search?: string
}

export class ListProductsUseCase {
  constructor(private readonly repository: IInventoryRepository) {}

  async execute(request: ListProductsRequest): Promise<Product[]> {
    const products = await this.repository.listProducts(request.search)
    
    if (request.active !== undefined) {
      return products.filter(p => request.active ? p.isActive() : !p.isActive())
    }
    
    return products
  }
}