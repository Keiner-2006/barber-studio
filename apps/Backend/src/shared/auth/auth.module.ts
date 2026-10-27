import { Module, Global } from '@nestjs/common';
import { BetterAuthModule } from './better-auth.module';
import { AuthService } from './auth.service';
import { RoleResolverService } from './role-resolver.service';

@Global()
@Module({
  imports: [BetterAuthModule],
  providers: [AuthService, RoleResolverService],
  exports: [AuthService, RoleResolverService, BetterAuthModule],
})
export class AuthModule {}