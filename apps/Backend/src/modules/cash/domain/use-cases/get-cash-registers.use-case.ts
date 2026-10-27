import { Injectable, Inject } from '@nestjs/common';
import type { ICashRegisterRepository, CashRegister } from '../cash.domain';

@Injectable()
export class GetCashRegistersUseCase {
  constructor(@Inject('ICashRegisterRepository') private readonly repo: ICashRegisterRepository) {}

  async execute(tenantId: string): Promise<CashRegister[]> {
    return this.repo.findAll(tenantId);
  }
}