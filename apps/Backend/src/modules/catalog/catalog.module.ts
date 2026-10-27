import { Module } from '@nestjs/common';
import { CatalogController } from './adapters/http/catalog.controller';
import { TypeOrmServiceCategoryRepository } from './drivers/persistence/typeorm-service-category.repository';
import { TypeOrmServiceRepository } from './drivers/persistence/typeorm-service.repository';
import { GetServicesUseCase } from './domain/use-cases/get-services.use-case';
import { GetServiceCategoriesUseCase } from './domain/use-cases/get-service-categories.use-case';

@Module({
  controllers: [CatalogController],
  providers: [
    TypeOrmServiceCategoryRepository,
    TypeOrmServiceRepository,
    GetServicesUseCase,
    GetServiceCategoriesUseCase,
    {
      provide: 'IServiceCategoryRepository',
      useExisting: TypeOrmServiceCategoryRepository,
    },
    {
      provide: 'IServiceRepository',
      useExisting: TypeOrmServiceRepository,
    },
  ],
  exports: [TypeOrmServiceCategoryRepository, TypeOrmServiceRepository, 'IServiceCategoryRepository', 'IServiceRepository', GetServicesUseCase, GetServiceCategoriesUseCase],
})
export class CatalogModule {}