import { Module } from '@nestjs/common';
import { CashController } from './adapters/http/cash.controller';
import { TypeOrmCashRegisterRepository } from './drivers/persistence/typeorm-cash-register.repository';
import { TypeOrmCashTransactionRepository } from './drivers/persistence/typeorm-cash-transaction.repository';
import { GetCashRegistersUseCase } from './domain/use-cases/get-cash-registers.use-case';

@Module({
  controllers: [CashController],
  providers: [
    TypeOrmCashRegisterRepository,
    TypeOrmCashTransactionRepository,
    GetCashRegistersUseCase,
    {
      provide: 'ICashRegisterRepository',
      useExisting: TypeOrmCashRegisterRepository,
    },
    {
      provide: 'ICashTransactionRepository',
      useExisting: TypeOrmCashTransactionRepository,
    },
  ],
  exports: [TypeOrmCashRegisterRepository, TypeOrmCashTransactionRepository, 'ICashRegisterRepository', 'ICashTransactionRepository', GetCashRegistersUseCase],
})
export class CashModule {}