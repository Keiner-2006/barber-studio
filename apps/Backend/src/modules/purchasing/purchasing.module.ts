import { Module } from '@nestjs/common';
import { PurchasingController } from './adapters/http/purchasing.controller';
import { TypeOrmSupplierRepository } from './drivers/persistence/typeorm-supplier.repository';
import { TypeOrmPurchaseOrderRepository } from './drivers/persistence/typeorm-purchase-order.repository';
import { GetSuppliersUseCase } from './domain/use-cases/get-suppliers.use-case';

@Module({
  controllers: [PurchasingController],
  providers: [
    TypeOrmSupplierRepository,
    TypeOrmPurchaseOrderRepository,
    GetSuppliersUseCase,
    {
      provide: 'ISupplierRepository',
      useExisting: TypeOrmSupplierRepository,
    },
    {
      provide: 'IPurchaseOrderRepository',
      useExisting: TypeOrmPurchaseOrderRepository,
    },
  ],
  exports: [TypeOrmSupplierRepository, TypeOrmPurchaseOrderRepository, 'ISupplierRepository', 'IPurchaseOrderRepository', GetSuppliersUseCase],
})
export class PurchasingModule {}