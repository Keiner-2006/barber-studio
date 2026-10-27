import { Injectable, Inject } from '@nestjs/common';
import type { ICustomerRepository, Customer } from '../customer.domain';

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(@Inject('ICustomerRepository') private readonly repo: ICustomerRepository) {}

  async execute(tenantId: string, id: string): Promise<Customer | null> {
    return this.repo.findById(tenantId, id);
  }
}
