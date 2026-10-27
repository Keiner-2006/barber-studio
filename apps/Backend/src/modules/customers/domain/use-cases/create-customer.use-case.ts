import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepository, Customer, CreateCustomerData } from '../customer.domain';

@Injectable()
export class CreateCustomerUseCase {
  constructor(@Inject('ICustomerRepository') private readonly repo: ICustomerRepository) {}

  async execute(tenantId: string, data: CreateCustomerData): Promise<Customer> {
    return this.repo.create(tenantId, data);
  }
}
