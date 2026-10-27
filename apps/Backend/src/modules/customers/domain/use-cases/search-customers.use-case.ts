import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepository, Customer } from '../customer.domain';

@Injectable()
export class SearchCustomersUseCase {
  constructor(@Inject('ICustomerRepository') private readonly repo: ICustomerRepository) {}

  async execute(tenantId: string, query: string): Promise<Customer[]> {
    // Simple search implementation - in reality, you'd want a more sophisticated search
    const all = await this.repo.findAll(tenantId);
    const lowerQuery = query.toLowerCase();
    return all.filter(
      (c) =>
        c.fullName.toLowerCase().includes(lowerQuery) ||
        c.lastName.toLowerCase().includes(lowerQuery) ||
        c.email?.toLowerCase().includes(lowerQuery) ||
        c.phone?.includes(query) ||
        c.document?.includes(query),
    );
  }
}