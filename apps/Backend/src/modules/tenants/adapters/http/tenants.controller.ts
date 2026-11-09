import {
  Controller,
  Get,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity } from '../../../auth/drivers/persistence/platform-tenant.entity';
import { GetBranchesUseCase } from '../../../branches/domain/use-cases/get-branches.use-case';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(
    @Inject(AUTH_DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly getBranches: GetBranchesUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener tenant y contexto del usuario actual' })
  @ApiResponse({ status: 200, description: 'Contexto del tenant' })
  async getMyTenant(
    @RequestContext('tenantId') tenantId: string | undefined,
    @RequestContext('userRole') userRole: string | undefined,
  ) {
    const role = userRole || null;

    if (!tenantId) {
      return { role, tenant: null, branches: [] };
    }

    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });

    const list = await this.getBranches.execute(tenantId);
    const branches: Array<Record<string, unknown>> = (list || [])
      .map((branch: any) => (typeof branch?.toPlain === 'function' ? branch.toPlain() : branch))
      .filter((branch: any) => !branch?.status || branch.status === 'active');

    return {
      role,
      tenant: tenant
        ? {
            id: tenant.id,
            name: tenant.tradeName || tenant.legalName || tenant.slug,
            slug: tenant.slug,
            currencyCode: tenant.currencyCode,
            countryCode: tenant.countryCode,
            timezone: tenant.timezone,
          }
        : null,
      branches,
    };
  }
}
