import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../../shared/auth/auth.service';
import { RoleResolverService } from '../../shared/auth/role-resolver.service';
import { RateLimitService } from '../../shared/http/rate-limit.service';
import { TenantContextService } from '../../shared/tenancy/tenant-context.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RoleResolverService, RateLimitService, TenantContextService],
  exports: [AuthService, RoleResolverService],
})
export class AuthModule {}