import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
  Body,
  Req,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { z } from 'zod';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { Inject } from '@nestjs/common';
import { DataSource, EntityManager, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity, TenantStatusEnum, BusinessTypeEnum } from '../../../auth/drivers/persistence/platform-tenant.entity';
import { PlatformMembershipEntity, PlatformMembershipRoleEnum } from '../../../auth/drivers/persistence/platform-membership.entity';
import { PlatformUserEntity, PlatformUserStatusEnum } from '../../../auth/drivers/persistence/platform-user.entity';
import { PlatformAuditEventEntity } from '../../../auth/drivers/persistence/platform-audit-event.entity';
import { seedTenantWorkspace } from '../../../onboarding/domain/services/tenant-workspace.seed';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createTenantSchema = z.object({
  tradeName: z.string().trim().min(2).max(150),
  legalName: z.string().trim().min(2).max(150),
  slug: z.string().trim().max(100).regex(SLUG_REGEX, 'El slug solo puede tener minúsculas, números y guiones'),
  businessType: z.nativeEnum(BusinessTypeEnum).default(BusinessTypeEnum.BARBERIA),
  countryCode: z.string().trim().length(2).default('CO'),
  ownerEmail: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(30).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  city: z.string().trim().max(100).optional(),
  address: z.string().trim().max(200).optional(),
});

const statusSchema = z.object({
  status: z.enum([TenantStatusEnum.ACTIVE, TenantStatusEnum.SUSPENDED]),
  reason: z.string().trim().min(3, 'Indica el motivo').max(300),
});

type OwnerSummary = { name: string; email: string } | null;

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

    const countsByStatus = counts.reduce<Partial<Record<TenantStatusEnum, number>>>((result, row) => {
      result[row.status] = Number(row.count);
      return result;
    }, {});
    const total = Object.values(countsByStatus).reduce((sum, count) => sum + (count ?? 0), 0);

    const payload: { total: number; countsByStatus: Partial<Record<TenantStatusEnum, number>>; tenants?: unknown[] } = {
      total,
      countsByStatus,
    };
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

    const ids = tenants.map((t) => t.id);
    const brandingRows: Array<{ tenant_id: string; logo_url: string | null; primary_color: string | null }> = ids.length
      ? await this.dataSource.query(`select tenant_id, logo_url, primary_color from tenant_branding where tenant_id = any($1)`, [ids])
      : [];
    const cityRows: Array<{ tenant_id: string; city: string | null }> = ids.length
      ? await this.dataSource.query(
          `select distinct on (tenant_id) tenant_id, city from branches where tenant_id = any($1) order by tenant_id, created_at`,
          [ids],
        )
      : [];
    const branding = new Map(brandingRows.map((b) => [b.tenant_id, b]));
    const cities = new Map(cityRows.map((c) => [c.tenant_id, c.city]));

    payload.tenants = tenants.map((tenant) => ({
      id: tenant.id,
      legalName: tenant.legalName,
      tradeName: tenant.tradeName,
      slug: tenant.slug,
      businessType: tenant.businessType,
      status: tenant.status,
      countryCode: tenant.countryCode,
      city: cities.get(tenant.id) ?? (tenant.settings as any)?.location?.city ?? null,
      phone: tenant.phone,
      whatsapp: tenant.whatsapp,
      createdAt: tenant.createdAt,
      branding: branding.has(tenant.id)
        ? { logoUrl: branding.get(tenant.id)!.logo_url, primaryColor: branding.get(tenant.id)!.primary_color }
        : null,
      owner: this.ownerOf(tenant.memberships),
    }));

    return payload;
  }

  @Get('tenants/:id')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Detalle de un negocio: datos, uso, sedes, equipo y auditoría' })
  async getTenant(@Param('id', new ParseUUIDPipe()) id: string) {
    const tenant = await this.dataSource.getRepository(PlatformTenantEntity).findOne({
      where: { id },
      relations: ['memberships', 'memberships.user'],
    });
    if (!tenant) throw new NotFoundException('Negocio no encontrado');

    const [usage] = await this.dataSource.query(
      `select
         (select count(*) from branches where tenant_id = $1)::int as branches,
         (select count(*) from staff_profiles where tenant_id = $1 and status = 'active')::int as staff,
         (select count(*) from services where tenant_id = $1 and active and deleted_at is null)::int as services,
         (select count(*) from customers where tenant_id = $1)::int as customers,
         (select count(*) from appointments where tenant_id = $1)::int as appointments_total,
         (select count(*) from appointments where tenant_id = $1 and starts_at >= now() - interval '30 days')::int as appointments_30d,
         (select coalesce(sum(price_snapshot), 0) from appointments
           where tenant_id = $1 and status = 'completed' and starts_at >= now() - interval '30 days')::float as revenue_30d,
         (select max(starts_at) from appointments where tenant_id = $1) as last_appointment_at`,
      [id],
    );

    const branches = await this.dataSource.query(
      `select id, name, code, address, city, phone, status, operating_hours as "operatingHours", created_at as "createdAt"
         from branches where tenant_id = $1 order by created_at`,
      [id],
    );
    const staff = await this.dataSource.query(
      `select s.id, s.display_name as "displayName", s.status, s.is_bookable as "isBookable", b.name as "branchName"
         from staff_profiles s left join branches b on b.id = s.branch_id
        where s.tenant_id = $1 order by s.display_name`,
      [id],
    );
    const [branding] = await this.dataSource.query(
      `select logo_url as "logoUrl", primary_color as "primaryColor", description, social_links as "socialLinks",
              public_booking_enabled as "publicBookingEnabled"
         from tenant_branding where tenant_id = $1`,
      [id],
    );
    const audit = await this.dataSource.getRepository(PlatformAuditEventEntity).find({
      where: { tenantId: id },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    const members = (tenant.memberships ?? [])
      .filter((m) => m.user)
      .map((m) => ({
        role: m.role,
        status: m.status,
        name: [m.user.name, m.user.lastName].filter(Boolean).join(' '),
        email: m.user.email,
        lastLoginAt: m.user.lastLoginAt ?? null,
      }));

    const settings = (tenant.settings ?? {}) as Record<string, any>;
    return {
      id: tenant.id,
      legalName: tenant.legalName,
      tradeName: tenant.tradeName,
      slug: tenant.slug,
      businessType: tenant.businessType,
      status: tenant.status,
      countryCode: tenant.countryCode,
      timezone: tenant.timezone,
      currencyCode: tenant.currencyCode,
      phone: tenant.phone,
      whatsapp: tenant.whatsapp,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      location: settings.location ?? null,
      branding: branding ?? null,
      owner: this.ownerOf(tenant.memberships),
      members,
      usage: {
        branches: usage.branches,
        staff: usage.staff,
        services: usage.services,
        customers: usage.customers,
        appointmentsTotal: usage.appointments_total,
        appointments30d: usage.appointments_30d,
        revenue30d: usage.revenue_30d,
        lastAppointmentAt: usage.last_appointment_at,
      },
      branches,
      staff,
      audit: audit.map((e) => this.toAuditDto(e)),
    };
  }

  @Patch('tenants/:id/status')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Suspender o reactivar un negocio (queda en auditoría)' })
  async setTenantStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown, @Req() req: Request) {
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues[0]?.message ?? 'Datos inválidos');
    const { status, reason } = parsed.data;

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(PlatformTenantEntity);
      const tenant = await repo.findOne({ where: { id } });
      if (!tenant) throw new NotFoundException('Negocio no encontrado');
      if (tenant.status === status) return { id, status };
      if (![TenantStatusEnum.ACTIVE, TenantStatusEnum.SUSPENDED, TenantStatusEnum.PROVISIONING].includes(tenant.status)) {
        throw new BadRequestException(`No se puede cambiar un negocio en estado ${tenant.status}`);
      }
      const previous = tenant.status;
      tenant.status = status;
      await repo.save(tenant);
      await this.audit(manager, req, {
        tenantId: id,
        action: status === TenantStatusEnum.SUSPENDED ? 'tenant.suspend' : 'tenant.activate',
        resourceId: id,
        metadata: { from: previous, to: status, reason },
      });
      // Members keep a cached identity for up to 30s (TenantContextService) before the change applies.
      return { id, status };
    });
  }

  @Post('tenants')
  @Permissions('admin:write')
  @ApiOperation({ summary: 'Crear un negocio para un propietario que ya tiene cuenta' })
  @ApiResponse({ status: 201, description: 'Negocio creado y activo' })
  @ApiResponse({ status: 404, description: 'El propietario no tiene cuenta' })
  @ApiResponse({ status: 409, description: 'Slug duplicado' })
  async createTenant(@Body() body: unknown, @Req() req: Request) {
    const parsed = createTenantSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.issues[0]?.message ?? 'Datos inválidos');
    const input = parsed.data;

    return this.dataSource.transaction(async (manager) => {
      if (await manager.getRepository(PlatformTenantEntity).findOne({ where: { slug: input.slug } })) {
        throw new ConflictException({ field: 'slug', message: 'El slug ya está en uso' });
      }
      // Owners must already have an account (Better Auth): creating a business row for an unknown email
      // would let whoever registers that email later take it over.
      const owner = await manager.getRepository(PlatformUserEntity).findOne({ where: { email: input.ownerEmail } });
      if (!owner) {
        throw new NotFoundException('Ese correo no tiene cuenta. Comparte el enlace de inscripción para que el propietario se registre.');
      }
      if (owner.status !== PlatformUserStatusEnum.ACTIVE) throw new BadRequestException('La cuenta del propietario no está activa');

      const tenant = await manager.getRepository(PlatformTenantEntity).save(
        manager.getRepository(PlatformTenantEntity).create({
          legalName: input.legalName,
          tradeName: input.tradeName,
          slug: input.slug,
          businessType: input.businessType,
          countryCode: input.countryCode.toUpperCase(),
          timezone: 'America/Bogota',
          currencyCode: 'COP',
          status: TenantStatusEnum.ACTIVE,
          phone: input.phone || null,
          whatsapp: input.whatsapp || null,
          settings: { location: { city: input.city ?? null, address: input.address ?? null }, createdBy: 'platform_admin' },
        }),
      );
      await manager.getRepository(PlatformMembershipEntity).save(
        manager.getRepository(PlatformMembershipEntity).create({
          tenantId: tenant.id,
          userId: owner.id,
          role: PlatformMembershipRoleEnum.OWNER,
          status: 'active',
        }),
      );
      await seedTenantWorkspace(manager, {
        tenantId: tenant.id,
        slug: tenant.slug,
        tradeName: tenant.tradeName,
        countryCode: tenant.countryCode,
        timezone: tenant.timezone,
        currencyCode: tenant.currencyCode,
        location: { city: input.city, address: input.address, whatsapp: input.whatsapp },
      });
      await this.audit(manager, req, {
        tenantId: tenant.id,
        action: 'tenant.create',
        resourceId: tenant.id,
        metadata: { slug: tenant.slug, ownerEmail: owner.email },
      });
      return { id: tenant.id, slug: tenant.slug, status: tenant.status };
    });
  }

  @Get('users')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Propietarios de negocios y sus negocios' })
  @ApiQuery({ name: 'role', required: false, enum: ['owner'] })
  async listUsers(@Query('role') role = 'owner') {
    if (role !== 'owner') throw new BadRequestException('Solo se admite role=owner');
    const rows: Array<Record<string, any>> = await this.dataSource.query(
      `select u.id, u.email, u.name, u.last_name, u.phone, u.whatsapp, u.status, u.last_login_at, u.created_at,
              json_agg(json_build_object('id', t.id, 'tradeName', t.trade_name, 'slug', t.slug, 'status', t.status,
                                         'countryCode', t.country_code) order by t.created_at) as tenants
         from platform_users u
         join platform_memberships m on m.user_id = u.id and m.role = 'owner' and m.status = 'active'
         join platform_tenants t on t.id = m.tenant_id
        group by u.id
        order by max(t.created_at) desc`,
    );
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: [r.name, r.last_name].filter(Boolean).join(' '),
      phone: r.phone,
      whatsapp: r.whatsapp,
      status: r.status,
      lastLoginAt: r.last_login_at,
      createdAt: r.created_at,
      tenants: r.tenants,
    }));
  }

  @Get('audit-events')
  @Permissions('admin:read')
  @ApiOperation({ summary: 'Listar eventos de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de eventos de auditoría' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAuditEvents(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('action') action?: string,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (from && to) where.createdAt = Between(new Date(from), new Date(to));
    else if (from) where.createdAt = MoreThanOrEqual(new Date(from));
    else if (to) where.createdAt = LessThanOrEqual(new Date(to));
    if (action) where.action = action;
    if (tenantId) where.tenantId = tenantId;

    const take = Math.min(Math.max(parseInt(limit ?? '100', 10) || 100, 1), 500);
    const events = await this.dataSource.getRepository(PlatformAuditEventEntity).find({
      where,
      order: { createdAt: 'DESC' },
      take,
    });
    return events.map((e) => this.toAuditDto(e));
  }

  private ownerOf(memberships: PlatformMembershipEntity[] | undefined): OwnerSummary {
    const owner = memberships?.find((m) => m.role === PlatformMembershipRoleEnum.OWNER && m.status === 'active')?.user;
    return owner ? { name: [owner.name, owner.lastName].filter(Boolean).join(' '), email: owner.email } : null;
  }

  private toAuditDto(e: PlatformAuditEventEntity) {
    return {
      id: e.id,
      actorId: e.actorId,
      tenantId: e.tenantId,
      action: e.action,
      resource: e.resource,
      resourceId: e.resourceId,
      result: e.result,
      metadata: e.metadata,
      ipAddress: e.ipAddress,
      createdAt: e.createdAt,
    };
  }

  private async audit(
    manager: EntityManager,
    req: Request,
    event: { tenantId: string; action: string; resourceId: string; metadata: Record<string, unknown> },
  ) {
    const email = (req as any).user?.email as string | undefined;
    const actor = email ? await manager.getRepository(PlatformUserEntity).findOne({ where: { email } }) : null;
    await manager.getRepository(PlatformAuditEventEntity).save(
      manager.getRepository(PlatformAuditEventEntity).create({
        actorId: actor?.id ?? null,
        tenantId: event.tenantId,
        action: event.action,
        resource: 'tenant',
        resourceId: event.resourceId,
        result: 'success',
        metadata: JSON.stringify({ ...event.metadata, actorEmail: email ?? null }),
        ipAddress: (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ?? req.ip ?? null,
        userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
      } as any),
    );
  }
}
