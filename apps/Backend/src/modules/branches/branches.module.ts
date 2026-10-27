import { Module } from '@nestjs/common';
import { BranchesController } from './adapters/http/branches.controller';
import { TypeOrmBranchRepository } from './drivers/persistence/typeorm-branch.repository';
import { GetBranchesUseCase } from './domain/use-cases/get-branches.use-case';
import { CreateBranchUseCase } from './domain/use-cases/create-branch.use-case';
import { AvailabilityController, StaffController } from './adapters/http/staff.controller';

@Module({
  controllers: [BranchesController, StaffController, AvailabilityController],
  providers: [
    TypeOrmBranchRepository,
    GetBranchesUseCase,
    CreateBranchUseCase,
    {
      provide: 'IBranchRepository',
      useExisting: TypeOrmBranchRepository,
    },
  ],
  exports: [TypeOrmBranchRepository, 'IBranchRepository', GetBranchesUseCase, CreateBranchUseCase],
})
export class BranchesModule {}