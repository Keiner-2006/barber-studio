import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity } from '../../../auth/drivers/persistence/platform-tenant.entity';
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
    return { data: tenants.map((t) => ({
      id: t.id,
      legalName: t.legalName,
      tradeName: t.tradeName,
      slug: t.slug,
      status: t.status,
      countryCode: t.countryCode,
      currencyCode: t.currencyCode,
      createdAt: t.createdAt,
    })) };
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

    return { data: events.map((e) => ({
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
    })) };
  }
}
