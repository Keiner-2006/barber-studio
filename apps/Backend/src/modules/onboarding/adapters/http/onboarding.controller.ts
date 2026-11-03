import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity } from '../../../auth/drivers/persistence/platform-tenant.entity';
import { TenantProvisioningJobEntity } from '../../../auth/drivers/persistence/tenant-provisioning-job.entity';
import { AuthService } from '../../../../shared/auth/auth.service';
import { OnboardingProvisioningService } from '../../domain/services/onboarding-provisioning.service';
import { CreateOnboardingDto } from '../../domain/dtos/create-onboarding.dto';

@ApiTags('onboarding')
@Controller('onboarding')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(
    @Inject(AUTH_DATA_SOURCE) private readonly dataSource: DataSource,
    private readonly authService: AuthService,
    private readonly provisioningService: OnboardingProvisioningService,
  ) {}

  @Post('tenants')
  @Public()
  @Permissions('onboarding:write')
  @ApiOperation({ summary: 'Crear tenant (onboarding)' })
  @ApiResponse({ status: 201, description: 'Tenant creado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Slug duplicado' })
  async createTenant(
    @Body() dto: CreateOnboardingDto,
    @Req() req: Request,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const authHeader = (req.headers as unknown as Record<string, string | undefined>)['authorization'];
    const headersLike = { get: (key: string) => (key === 'authorization' ? authHeader : undefined) } as unknown as Headers;
    const session = authHeader ? await this.authService.getSession(headersLike) : null;
    const actorEmail = session?.user?.email;

    const result = await this.provisioningService.provision(dto, actorEmail, idempotencyKey);

    return {
      data: {
        jobId: result.jobId,
        tenantId: result.tenantId,
        status: result.status,
      },
    };
  }

  @Get('slug')
  @Public()
  @Permissions('onboarding:read')
  @ApiOperation({ summary: 'Verificar disponibilidad de slug' })
  @ApiResponse({ status: 200, description: 'Disponibilidad del slug' })
  @ApiQuery({ name: 'slug', required: true, type: String })
  async checkSlugAvailability(@Query('slug') slug: string) {
    if (!slug) {
      return { data: { slug: '', available: false, error: 'slug es requerido' } };
    }
    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const tenant = await tenantRepo.findOne({ where: { slug } });
    return { data: { slug, available: !tenant } };
  }

  @Get('tenants/:jobId')
  @Public()
  @Permissions('onboarding:read')
  @ApiOperation({ summary: 'Obtener estado de onboarding por job' })
  @ApiResponse({ status: 200, description: 'Estado de onboarding' })
  async getOnboardingStatus(@Param('jobId') jobId: string) {
    const jobRepo = this.dataSource.getRepository(TenantProvisioningJobEntity);
    const job = await jobRepo.findOne({ where: { id: jobId } });

    if (!job) {
      return { data: { jobId, status: 'not_found' } };
    }

    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const tenant = await tenantRepo.findOne({ where: { id: job.tenantId } });

    return {
      data: {
        jobId,
        tenantId: job.tenantId,
        status: job.status,
        step: job.step,
        errorCode: job.errorCode,
        errorDetail: job.errorDetail,
        tenantStatus: tenant ? tenant.status : null,
      },
    };
  }
}
