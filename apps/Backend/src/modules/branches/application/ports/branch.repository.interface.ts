import { Branch } from '../../domain/entities/branch.entity';

export interface IBranchRepository {
  findAll(): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  findByCode(code: string): Promise<Branch | null>;
  create(data: { code: string; name: string; address?: string; phone?: string; timezone?: string; currency?: string }): Promise<Branch>;
}