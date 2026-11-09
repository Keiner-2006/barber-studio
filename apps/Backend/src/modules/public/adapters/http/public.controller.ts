import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { Public } from '../../../../common/decorators/public.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity } from '../../../auth/drivers/persistence/platform-tenant.entity';

@ApiTags('public')
@Controller('public')
@UseGuards(AuthGuard)
export class PublicController {
  constructor(
    @Inject(AUTH_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @Get('businesses/:slug')
  @Public()
  @ApiOperation({ summary: 'Obtener negocio público por slug' })
  @ApiResponse({ status: 200, description: 'Información pública del negocio' })
  @ApiResponse({ status: 404, description: 'Negocio no encontrado' })
  async getBusinessBySlug(@Param('slug') slug: string) {
    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const tenant = await tenantRepo.findOne({ where: { slug } });

    if (!tenant) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return {
      id: tenant.id,
      tradeName: tenant.tradeName,
      legalName: tenant.legalName,
      slug: tenant.slug,
      businessType: tenant.businessType,
      countryCode: tenant.countryCode,
      whatsapp: tenant.whatsapp ?? null,
    };
  }
}
