import { Injectable, Inject } from '@nestjs/common';
import type { IBranchRepository, Branch, CreateBranchData } from '../branch.domain';
import { ConflictError } from '../../../../shared/errors/app-error';

@Injectable()
export class CreateBranchUseCase {
  constructor(@Inject('IBranchRepository') private readonly branchRepo: IBranchRepository) {}

  async execute(tenantId: string, data: CreateBranchData): Promise<Branch> {
    const existing = await this.branchRepo.findByCode(tenantId, data.code);
    if (existing) {
      throw new ConflictError('Ya existe una sucursal con ese código');
    }
    return this.branchRepo.create(tenantId, data);
  }
}