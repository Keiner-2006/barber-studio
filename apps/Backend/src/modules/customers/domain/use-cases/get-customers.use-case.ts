import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepository, Customer } from '../customer.domain';

@Injectable()
export class GetCustomersUseCase {
  constructor(@Inject('ICustomerRepository') private readonly repo: ICustomerRepository) {}

  async execute(tenantId: string): Promise<Customer[]> {
    return this.repo.findAll(tenantId);
  }
}