import {
  Controller,
  Get,
  Post,
  UseGuards,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity, TenantStatusEnum, BusinessTypeEnum } from '../../../auth/drivers/persistence/platform-tenant.entity';
import { PlatformMembershipRoleEnum } from '../../../auth/drivers/persistence/platform-membership.entity';
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
  @ApiQuery({ name: 'list', required: false, description: 'Incluir los registros de negocios' })
  @ApiQuery({ name: 'limit', required: false, description: 'Máximo de negocios a incluir (1-500)' })
  @ApiQuery({ name: 'status', required: false, enum: TenantStatusEnum })
  async listTenants(
    @Query('list') includeList?: string,
    @Query('limit') limitParam?: string,
    @Query('status') statusParam?: string,
  ) {
    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const counts = await tenantRepo
      .createQueryBuilder('tenant')
      .select('tenant.status', 'status')
      .addSelect('COUNT(tenant.id)', 'count')
      .groupBy('tenant.status')
      .getRawMany<{ status: TenantStatusEnum; count: string }>();

    const countsByStatus = counts.reduce<Partial<Record<TenantStatusEnum, number>>>(
      (result, row) => {
        result[row.status] = Number(row.count);
        return result;
      },
      {},
    );
    const total = Object.values(countsByStatus).reduce((sum, count) => sum + (count ?? 0), 0);

    const payload: {
      total: number;
      countsByStatus: Partial<Record<TenantStatusEnum, number>>;
      tenants?: Array<{
        id: string;
        legalName: string;
        tradeName: string;
        slug: string;
        businessType: BusinessTypeEnum;
        status: TenantStatusEnum;
        countryCode: string;
        phone: string | null;
        createdAt: Date;
        branding: null;
        owner: { name: string; email: string } | null;
      }>;
    } = { total, countsByStatus };

    if (includeList !== 'true') return payload;

    const limit = limitParam === undefined ? 200 : Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      throw new BadRequestException('El límite debe ser un entero entre 1 y 500');
    }
    const status = Object.values(TenantStatusEnum).find((value) => value === statusParam);
    if (statusParam && !status) {
      throw new BadRequestException('El estado del negocio no es válido');
    }

    const tenants = await tenantRepo.find({
      where: status ? { status } : undefined,
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['memberships', 'memberships.user'],
    });

    payload.tenants = tenants.map((tenant) => {
      const owner = tenant.memberships?.find(
        (membership) =>
          membership.role === PlatformMembershipRoleEnum.OWNER && membership.status === 'active',
      )?.user;
      return {
        id: tenant.id,
        legalName: tenant.legalName,
        tradeName: tenant.tradeName,
        slug: tenant.slug,
        businessType: tenant.businessType,
        status: tenant.status,
        countryCode: tenant.countryCode,
        phone: tenant.phone,
        createdAt: tenant.createdAt,
        branding: null,
        owner: owner ? { name: [owner.name, owner.lastName].filter(Boolean).join(' '), email: owner.email } : null,
      };
    });

    return payload;
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
