import { Module, Global } from '@nestjs/common';
import { RequestContextService, REQUEST_CONTEXT_SERVICE } from './request-context.service';
import { TenantContextService } from './tenant-context.service';

@Global()
@Module({
  providers: [
    { provide: REQUEST_CONTEXT_SERVICE, useClass: RequestContextService },
    TenantContextService,
  ],
  exports: [REQUEST_CONTEXT_SERVICE, TenantContextService],
})
export class TenancyModule {}