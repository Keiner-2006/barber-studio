import { Injectable, Inject } from '@nestjs/common';
import type { IServiceRepository, Service } from '../catalog.domain';

@Injectable()
export class GetServicesUseCase {
  constructor(@Inject('IServiceRepository') private readonly repo: IServiceRepository) {}

  async execute(tenantId: string, categoryId?: string): Promise<Service[]> {
    return this.repo.findAll(tenantId, categoryId);
  }
}