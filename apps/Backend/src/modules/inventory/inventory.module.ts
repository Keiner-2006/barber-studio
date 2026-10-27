import { Module } from '@nestjs/common';
import { InventoryController } from './adapters/http/inventory.controller';
import { TypeOrmProductRepository } from './drivers/persistence/typeorm-product.repository';
import { TypeOrmBranchInventoryRepository } from './drivers/persistence/typeorm-branch-inventory.repository';
import { GetProductsUseCase } from './domain/use-cases/get-products.use-case';

@Module({
  controllers: [InventoryController],
  providers: [
    TypeOrmProductRepository,
    TypeOrmBranchInventoryRepository,
    GetProductsUseCase,
    {
      provide: 'IProductRepository',
      useExisting: TypeOrmProductRepository,
    },
    {
      provide: 'IBranchInventoryRepository',
      useExisting: TypeOrmBranchInventoryRepository,
    },
  ],
  exports: [TypeOrmProductRepository, TypeOrmBranchInventoryRepository, 'IProductRepository', 'IBranchInventoryRepository', GetProductsUseCase],
})
export class InventoryModule {}