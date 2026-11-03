import { Module, Global } from '@nestjs/common';
import { BetterAuthModule } from './better-auth.module';
import { AuthService } from './auth.service';
import { RoleResolverService } from './role-resolver.service';
import { AuthController } from '../../modules/auth/auth.controller';
import { RateLimitService } from '../http/rate-limit.service';

@Global()
@Module({
  imports: [BetterAuthModule],
  controllers: [AuthController],
  providers: [AuthService, RoleResolverService, RateLimitService],
  exports: [AuthService, RoleResolverService, BetterAuthModule],
})
export class AuthModule {}