import { Injectable, Inject } from '@nestjs/common';
import type { ISupplierRepository, Supplier } from '../purchasing.domain';

@Injectable()
export class GetSuppliersUseCase {
  constructor(@Inject('ISupplierRepository') private readonly repo: ISupplierRepository) {}

  async execute(tenantId: string): Promise<Supplier[]> {
    return this.repo.findAll(tenantId);
  }
}