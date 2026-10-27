import { Module } from '@nestjs/common';
import { CustomersController } from './adapters/http/customers.controller';
import { TypeOrmCustomerRepository } from './drivers/persistence/typeorm-customer.repository';
import { GetCustomersUseCase } from './domain/use-cases/get-customers.use-case';
import { SearchCustomersUseCase } from './domain/use-cases/search-customers.use-case';
import { CreateCustomerUseCase } from './domain/use-cases/create-customer.use-case';
import { GetCustomerByIdUseCase } from './domain/use-cases/get-customer-by-id.use-case';

@Module({
  controllers: [CustomersController],
  providers: [
    TypeOrmCustomerRepository,
    GetCustomersUseCase,
    SearchCustomersUseCase,
    CreateCustomerUseCase,
    GetCustomerByIdUseCase,
    {
      provide: 'ICustomerRepository',
      useExisting: TypeOrmCustomerRepository,
    },
  ],
  exports: [TypeOrmCustomerRepository, 'ICustomerRepository', GetCustomersUseCase, SearchCustomersUseCase, CreateCustomerUseCase, GetCustomerByIdUseCase],
})
export class CustomersModule {}