import { Global, Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { PermissionsGuard } from './permissions.guard';
import { TenancyModule } from '../../shared/tenancy/tenancy.module';
import { AuthModule } from '../../shared/auth/auth.module';

@Global()
@Module({
  imports: [TenancyModule, AuthModule],
  providers: [AuthGuard, PermissionsGuard],
  exports: [AuthGuard, PermissionsGuard],
})
export class GuardsModule {}
