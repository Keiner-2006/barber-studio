import { Injectable, Inject } from '@nestjs/common';
import type { IBranchRepository, Branch } from '../branch.domain';

@Injectable()
export class GetBranchesUseCase {
  constructor(@Inject('IBranchRepository') private readonly branchRepo: IBranchRepository) {}

  async execute(tenantId: string): Promise<Branch[]> {
    return this.branchRepo.findAll(tenantId);
  }
}