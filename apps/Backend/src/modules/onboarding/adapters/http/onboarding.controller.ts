import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { BusinessTypeEnum, PlatformTenantEntity, TenantStatusEnum } from '../../../auth/drivers/persistence/platform-tenant.entity';

@ApiTags('onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(
    @Inject(AUTH_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @Post('tenants')
  @Public()
  @Permissions('onboarding:write')
  @ApiOperation({ summary: 'Crear tenant (onboarding)' })
  @ApiResponse({ status: 201, description: 'Tenant creado' })
  async createTenant(@Body() body: any) {
    const { legalName, tradeName, slug, businessType, countryCode, timezone, currencyCode } = body;

    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);

    const tenant = tenantRepo.create({
      legalName,
      tradeName,
      slug,
      businessType: (businessType || BusinessTypeEnum.BARBERIA) as BusinessTypeEnum,
      countryCode: countryCode || 'CO',
      timezone: timezone || 'America/Bogota',
      currencyCode: currencyCode || 'COP',
      status: TenantStatusEnum.PROVISIONING,
    });

    const savedTenant = await tenantRepo.save(tenant);

    return { data: { id: savedTenant.id, status: savedTenant.status } };
  }

  @Get('tenants/:jobId')
  @Public()
  @Permissions('onboarding:read')
  @ApiOperation({ summary: 'Obtener estado de onboarding' })
  @ApiResponse({ status: 200, description: 'Estado de onboarding' })
  async getOnboardingStatus(@Param('jobId') jobId: string) {
    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const tenant = await tenantRepo.findOne({ where: { id: jobId } });

    if (!tenant) {
      return { data: { jobId, status: 'not_found' } };
    }

    return { data: { jobId, status: tenant.status, tenantId: tenant.id } };
  }
}
