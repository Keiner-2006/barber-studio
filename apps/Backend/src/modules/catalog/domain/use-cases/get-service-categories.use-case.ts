import { Injectable, Inject } from '@nestjs/common';
import type { IServiceCategoryRepository, ServiceCategory } from '../catalog.domain';

@Injectable()
export class GetServiceCategoriesUseCase {
  constructor(@Inject('IServiceCategoryRepository') private readonly repo: IServiceCategoryRepository) {}

  async execute(tenantId: string): Promise<ServiceCategory[]> {
    return this.repo.findAll(tenantId);
  }
}