import { IBranchRepository } from '../ports/IBranchRepository'
import { Branch } from '../../domain/entities/Branch'

export interface GetBranchesRequest {}

export class GetBranchesUseCase {
  constructor(private readonly repository: IBranchRepository) {}

  async execute(request: GetBranchesRequest): Promise<Branch[]> {
    return this.repository.list()
  }
}