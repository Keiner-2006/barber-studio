import { Injectable, Inject } from '@nestjs/common';
import type { IProductRepository } from '../inventory.domain';
import type { Product } from '../inventory.domain';

@Injectable()
export class GetProductsUseCase {
  constructor(@Inject('IProductRepository') private readonly repo: IProductRepository) {}

  async execute(tenantId: string): Promise<Product[]> {
    return this.repo.findAll(tenantId);
  }
}