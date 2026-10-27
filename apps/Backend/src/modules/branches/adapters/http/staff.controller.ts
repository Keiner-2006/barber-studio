import { Controller, Get, Post, Patch, Delete, Body, Query, Param, Inject, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { z } from 'zod';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';
import { NotFoundError, ValidationError } from '../../../../shared/errors/app-error';

const createStaffSchema = z.object({
  displayName: z.string().min(1),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  commissionRate: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  isBookable: z.boolean().optional(),
  email: z.string().email(),
});

const updateStaffSchema = createStaffSchema.partial().extend({ status: z.enum(['active', 'inactive']).optional() });

@ApiTags('staff')
@Controller('staff')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(@Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource) {}

  @Get()
  @Permissions('users:read')
  async list(@RequestContext('tenantId') tenantId: string) {
    const rows = await this.dataSource.query(
      `SELECT p.id, p.user_id AS "userId", p.display_name AS "displayName", p.bio,
              p.avatar_url AS "avatarUrl", p.commission_rate AS "commissionRate",
              p.is_bookable AS "isBookable", p.status, u.email,
              (SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = p.user_id AND ur.tenant_id = p.tenant_id
                ORDER BY ur.created_at LIMIT 1) AS role
         FROM staff_profiles p
         LEFT JOIN users u ON u.id = p.user_id
        WHERE p.tenant_id = $1
        ORDER BY p.display_name`,
      [tenantId],
    );
    return { data: rows };
  }

  @Post()
  @Permissions('users:write')
  @HttpCode(HttpStatus.CREATED)
  async create(@RequestContext('tenantId') tenantId: string, @Body() body: unknown) {
    const parsed = createStaffSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
    const [user] = await this.dataSource.query(
      `SELECT id FROM users WHERE tenant_id = $1 AND lower(email) = lower($2) LIMIT 1`,
      [tenantId, parsed.data.email],
    );
    if (!user) throw new NotFoundError('Usuario no encontrado');
    const [profile] = await this.dataSource.query(
      `INSERT INTO staff_profiles (tenant_id, user_id, display_name, bio, avatar_url, commission_rate, is_bookable, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING id, user_id AS "userId", display_name AS "displayName", bio, avatar_url AS "avatarUrl",
                 commission_rate AS "commissionRate", is_bookable AS "isBookable", status`,
      [tenantId, user.id, parsed.data.displayName, parsed.data.bio ?? null, parsed.data.avatarUrl ?? null,
        parsed.data.commissionRate ?? '0', parsed.data.isBookable ?? true],
    );
    return { data: profile };
  }

  @Patch()
  @Permissions('users:write')
  async update(
    @RequestContext('tenantId') tenantId: string,
    @Query('id') id: string,
    @Body() body: unknown,
  ) {
    if (!id) throw new ValidationError('id es requerido');
    const parsed = updateStaffSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
    const fields: Record<string, string> = {
      displayName: 'display_name', bio: 'bio', avatarUrl: 'avatar_url',
      commissionRate: 'commission_rate', isBookable: 'is_bookable',
    };
    const assignments: string[] = [];
    const values: unknown[] = [tenantId, id];
    for (const [key, column] of Object.entries(fields)) {
      const value = parsed.data[key as keyof typeof parsed.data];
      if (value !== undefined) {
        values.push(value);
        assignments.push(`${column} = $${values.length}`);
      }
    }
    if (parsed.data.status !== undefined) {
      values.push(parsed.data.status);
      assignments.push(`status = $${values.length}`);
    }
    if (assignments.length === 0) throw new ValidationError('No hay campos para actualizar');
    assignments.push('updated_at = now()');
    const rows = await this.dataSource.query(
      `UPDATE staff_profiles SET ${assignments.join(', ')} WHERE tenant_id = $1 AND id = $2
       RETURNING id, user_id AS "userId", display_name AS "displayName", bio, avatar_url AS "avatarUrl",
                 commission_rate AS "commissionRate", is_bookable AS "isBookable", status`,
      values,
    );
    if (!rows[0]) throw new NotFoundError('Personal no encontrado');
    return { data: rows[0] };
  }

  @Delete()
  @Permissions('users:write')
  async archive(@RequestContext('tenantId') tenantId: string, @Query('id') id: string) {
    if (!id) throw new ValidationError('id es requerido');
    const rows = await this.dataSource.query(
      `UPDATE staff_profiles SET status = 'inactive', updated_at = now()
        WHERE tenant_id = $1 AND id = $2
        RETURNING id, user_id AS "userId", display_name AS "displayName", status`,
      [tenantId, id],
    );
    if (!rows[0]) throw new NotFoundError('Personal no encontrado');
    return { data: rows[0] };
  }

  @Get(':id/schedule')
  @Permissions('appointments:read')
  async schedule(@RequestContext('tenantId') tenantId: string, @Param('id') id: string) {
    const [profile] = await this.dataSource.query(
      `SELECT id, display_name AS "displayName", status FROM staff_profiles WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id],
    );
    if (!profile) throw new NotFoundError('Staff no encontrado');
    const schedules = await this.dataSource.query(
      `SELECT id, staff_id AS "staffId", branch_id AS "branchId", day_of_week AS "dayOfWeek",
              start_time AS "startTime", end_time AS "endTime", valid_from AS "validFrom", valid_to AS "validTo"
         FROM staff_schedules WHERE tenant_id = $1 AND staff_id = $2 ORDER BY day_of_week, start_time`,
      [tenantId, id],
    );
    const timeOff = await this.dataSource.query(
      `SELECT id, staff_id AS "staffId", starts_at AS "startsAt", ends_at AS "endsAt", reason
         FROM staff_time_off WHERE tenant_id = $1 AND staff_id = $2 ORDER BY starts_at`,
      [tenantId, id],
    );
    return { data: { profile, schedules, timeOff } };
  }
}

@ApiTags('availability')
@Controller('availability')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(@Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource) {}

  @Get()
  @Permissions('appointments:read')
  async getAvailability(
    @RequestContext('tenantId') tenantId: string,
    @Query('staffId') staffId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const parsed = z.object({ staffId: z.string().uuid(), from: z.string().datetime(), to: z.string().datetime() })
      .safeParse({ staffId, from, to });
    if (!parsed.success) throw new ValidationError('staffId, from, to son requeridos');
    const start = new Date(parsed.data.from);
    const end = new Date(parsed.data.to);
    const scheduleRows = await this.dataSource.query(
      `SELECT start_time AS "startTime", end_time AS "endTime"
         FROM staff_schedules
        WHERE tenant_id = $1 AND staff_id = $2 AND day_of_week = $3
          AND valid_from <= $4 AND (valid_to IS NULL OR valid_to >= $4)
        ORDER BY start_time`,
      [tenantId, staffId, start.getDay(), start],
    );
    if (scheduleRows.length === 0) return { data: { slots: [], staffId, from: start.toISOString(), to: end.toISOString() } };
    const [timeOff, appointments] = await Promise.all([
      this.dataSource.query(
        `SELECT starts_at AS "startsAt", ends_at AS "endsAt" FROM staff_time_off
          WHERE tenant_id = $1 AND staff_id = $2 AND starts_at < $4 AND ends_at > $3`,
        [tenantId, staffId, start, end],
      ),
      this.dataSource.query(
        `SELECT starts_at AS "startsAt", ends_at AS "endsAt" FROM appointments
          WHERE tenant_id = $1 AND staff_id = $2 AND status NOT IN ('cancelled', 'no_show')
            AND starts_at < $4 AND ends_at > $3`,
        [tenantId, staffId, start, end],
      ),
    ]);
    const [openHour, openMinute] = String(scheduleRows[0].startTime).split(':').map(Number);
    const [closeHour, closeMinute] = String(scheduleRows[0].endTime).split(':').map(Number);
    const current = new Date(start);
    current.setHours(openHour, openMinute, 0, 0);
    const close = new Date(start);
    close.setHours(closeHour, closeMinute, 0, 0);
    const slots: string[] = [];
    while (current.getTime() + 60 * 60_000 <= close.getTime() && current < end) {
      const slotEnd = new Date(current.getTime() + 60 * 60_000);
      const overlaps = [...timeOff, ...appointments].some((period: { startsAt: Date; endsAt: Date }) =>
        current < new Date(period.endsAt) && slotEnd > new Date(period.startsAt));
      if (!overlaps) slots.push(current.toISOString());
      current.setTime(current.getTime() + 60 * 60_000);
    }
    return { data: { slots, staffId, from: start.toISOString(), to: end.toISOString() } };
  }
}
