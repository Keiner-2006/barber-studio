import { Module } from '@nestjs/common';
import { TenantsController } from './adapters/http/tenants.controller';
import { BranchesModule } from '../branches/branches.module';

@Module({
  imports: [BranchesModule],
  controllers: [TenantsController],
})
export class TenantsModule {}
