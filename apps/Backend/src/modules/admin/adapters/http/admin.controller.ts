import {
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity, TenantStatusEnum, BusinessTypeEnum } from '../../../auth/drivers/persistence/platform-tenant.entity';
import { PlatformAuditEventEntity } from '../../../auth/drivers/persistence/platform-audit-event.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    @Inject(AUTH_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @Get('tenants')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Listar tenants (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de tenants' })
  async listTenants() {
    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const tenants = await tenantRepo.find({
      order: { createdAt: 'DESC' },
    });
    return tenants.map((t) => ({
      id: t.id,
      legalName: t.legalName,
      tradeName: t.tradeName,
      slug: t.slug,
      status: t.status,
      countryCode: t.countryCode,
      currencyCode: t.currencyCode,
      phone: t.phone,
      whatsapp: t.whatsapp,
      createdAt: t.createdAt,
    }));
  }

  @Post('tenants')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Crear tenant (admin)' })
  @ApiResponse({ status: 201, description: 'Tenant creado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Slug duplicado' })
  async createTenant(@Body() body: { legalName?: string; tradeName?: string; slug?: string; businessType?: string; countryCode?: string; whatsapp?: string; phone?: string }) {
    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);

    const slugTaken = await tenantRepo.findOne({ where: { slug: body.slug } });
    if (slugTaken) {
      return { error: { field: 'slug', message: 'El slug ya está en uso' } };
    }

    const tenant = tenantRepo.create({
      legalName: body.legalName,
      tradeName: body.tradeName,
      slug: body.slug,
      businessType: (body.businessType || BusinessTypeEnum.BARBERIA) as BusinessTypeEnum,
      countryCode: body.countryCode || 'CO',
      timezone: 'America/Bogota',
      currencyCode: 'COP',
      status: TenantStatusEnum.PROVISIONING,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
    });

    const savedTenant = await tenantRepo.save(tenant);

    return { id: savedTenant.id, slug: savedTenant.slug, status: savedTenant.status, whatsapp: savedTenant.whatsapp } ;
  }

  @Get('audit-events')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Listar eventos de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de eventos de auditoría' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAuditEvents(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: string,
  ) {
    const auditRepo = this.dataSource.getRepository(PlatformAuditEventEntity);
    const where: any = {};
    if (from) where.createdAt = { ...where.createdAt, $gte: new Date(from) };
    if (to) where.createdAt = { ...where.createdAt, $lte: new Date(to) };
    if (action) where.action = action;

    const events = await auditRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit ? parseInt(limit, 10) : 100,
    });

    return events.map((e) => ({
      id: e.id,
      actorId: e.actorId,
      tenantId: e.tenantId,
      action: e.action,
      resource: e.resource,
      resourceId: e.resourceId,
      result: e.result,
      metadata: e.metadata,
      ipAddress: e.ipAddress,
      userAgent: e.userAgent,
      createdAt: e.createdAt,
    }));
  }
}
