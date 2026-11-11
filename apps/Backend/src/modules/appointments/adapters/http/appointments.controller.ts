import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { GetAppointmentsUseCase } from '../../domain/use-cases/get-appointments.use-case';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { Inject } from '@nestjs/common';
import type { IAppointmentRepository } from '../../domain/appointment.domain';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';
import { ConflictError, NotFoundError, ValidationError } from '../../../../shared/errors/app-error';
import { actorFrom, insertMovement, openSessionForBranch, tenantCurrency } from '../../../cash/domain/cash-ledger';
import { z } from 'zod';
import { ownStaffId, assertBarberAppointmentUpdate } from '../../../../shared/auth/barber-policy';

const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  staffId: z.string().uuid().optional(),
});

const appointmentPaymentSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Monto inválido')
    .refine((v) => Number(v) > 0, 'El monto debe ser mayor que cero'),
  method: z.enum(['cash', 'card_manual', 'transfer_manual', 'other']),
  reference: z.string().trim().max(120).optional(),
});

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(
    private readonly getAppointmentsUseCase: GetAppointmentsUseCase,
    @Inject('IAppointmentRepository') private readonly appointmentRepo: IAppointmentRepository,
    @Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @Get()
  @Permissions('appointments:read')
  @ApiOperation({ summary: 'Listar citas' })
  @ApiResponse({ status: 200, description: 'Lista de citas' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'staffId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startsAtFrom', required: false })
  @ApiQuery({ name: 'startsAtTo', required: false })
  async list(
    @RequestContext('tenantId') tenantId: string,
    @Query('branchId') branchId?: string,
    @Query('customerId') customerId?: string,
    @Query('staffId') staffId?: string,
    @Query('status') status?: string,
    @Query('startsAtFrom') startsAtFrom?: string,
    @Query('startsAtTo') startsAtTo?: string,
    @RequestContext('userRole') userRole?: string,
    @RequestContext('staffId') currentStaffId?: string,
  ) {
    const appointments = await this.getAppointmentsUseCase.execute(tenantId, {
      branchId,
      customerId,
      staffId: ownStaffId(userRole ?? '', currentStaffId, staffId),
      status: status as any,
      startsAtFrom: startsAtFrom ? new Date(startsAtFrom) : undefined,
      startsAtTo: startsAtTo ? new Date(startsAtTo) : undefined,
    });
    return appointments.map((a) => a.toPlain());
  }

  @Patch(':id')
  @Permissions('appointments:write')
  @ApiOperation({ summary: 'Actualizar cita (cambiar estado, etc.)' })
  @ApiResponse({ status: 200, description: 'Cita actualizada' })
  async updateAppointment(
    @RequestContext('tenantId') tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @RequestContext('userRole') userRole?: string,
    @RequestContext('staffId') currentStaffId?: string,
  ) {
    const parsed = updateAppointmentSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());

    if (userRole === 'barber') {
      const ownId = ownStaffId(userRole, currentStaffId)!;
      return this.dataSource.transaction(async (manager) => {
        const [appointment] = await manager.query(
          `SELECT staff_id AS "staffId", status FROM appointments
            WHERE tenant_id = $1 AND id = $2 AND staff_id = $3 FOR UPDATE`,
          [tenantId, id, ownId],
        );
        if (!appointment) throw new NotFoundError('Cita no encontrada');
        assertBarberAppointmentUpdate(ownId, appointment, parsed.data);
        const [updated] = await manager.query(
          `UPDATE appointments SET status = COALESCE($4, status), notes = COALESCE($5, notes), updated_at = now()
            WHERE tenant_id = $1 AND id = $2 AND staff_id = $3
            RETURNING id, tenant_id AS "tenantId", branch_id AS "branchId", customer_id AS "customerId",
                      service_id AS "serviceId", staff_id AS "staffId", starts_at AS "startsAt", ends_at AS "endsAt",
                      service_name_snapshot AS "serviceNameSnapshot", service_duration_snapshot AS "serviceDurationSnapshot",
                      status, source, price_snapshot AS "priceSnapshot", currency_snapshot AS "currencySnapshot",
                      notes, cancellation_reason AS "cancellationReason", created_at AS "createdAt", updated_at AS "updatedAt"`,
          [tenantId, id, ownId, parsed.data.status ?? null, parsed.data.notes ?? null],
        );
        return updated;
      });
    }

    const appointment = await this.appointmentRepo.findById(tenantId, id);
    if (!appointment) throw new NotFoundError('Cita no encontrada');

    const updated = await this.appointmentRepo.update(tenantId, id, {
      status: parsed.data.status as any,
      notes: parsed.data.notes,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
      staffId: parsed.data.staffId,
    } as any);
    if (!updated) throw new NotFoundError('Cita no encontrada');
    return updated.toPlain();
  }

  /**
   * Charges an appointment. Rules for a real front desk:
   * - cancelled / no-show appointments cannot be charged
   * - the total paid can never exceed the appointment price
   * - if the branch has an open cash session the payment is also booked there (type "appointment");
   *   cash payments REQUIRE an open session so the drawer always reconciles.
   */
  @Post(':id/payments')
  @Permissions('cash:write')
  @ApiOperation({ summary: 'Cobrar una cita (queda en la caja abierta de la sede)' })
  @ApiResponse({ status: 201, description: 'Pago registrado' })
  async recordPayment(
    @RequestContext('tenantId') tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const parsed = appointmentPaymentSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? 'Datos inválidos', parsed.error.flatten());
    const { amount, method, reference } = parsed.data;
    const actor = actorFrom(req);

    return this.dataSource.transaction(async (manager) => {
      const [appt] = await manager.query(
        `SELECT id, branch_id, status, price_snapshot, service_name_snapshot FROM appointments
          WHERE tenant_id = $1 AND id = $2 FOR UPDATE`,
        [tenantId, id],
      );
      if (!appt) throw new NotFoundError('Cita no encontrada');
      if (appt.status === 'cancelled' || appt.status === 'no_show') {
        throw new ConflictError('No se puede cobrar una cita cancelada o en la que el cliente no asistió');
      }

      const [{ paid }] = await manager.query(
        `SELECT COALESCE(SUM(amount), 0) AS paid FROM appointment_payments WHERE tenant_id = $1 AND appointment_id = $2 AND status = 'recorded'`,
        [tenantId, id],
      );
      const price = Number(appt.price_snapshot);
      const balance = price - Number(paid);
      if (Number(amount) > balance + 0.005) {
        throw new ConflictError(`El pago supera el saldo pendiente (${balance.toFixed(2)})`);
      }

      const session = await openSessionForBranch(manager, tenantId, appt.branch_id);
      if (method === 'cash' && !session) {
        throw new ConflictError('Abre la caja de la sede para cobrar en efectivo');
      }
      const currency = session?.currency ?? (await tenantCurrency(manager, tenantId));

      const [payment] = await manager.query(
        `INSERT INTO appointment_payments (tenant_id, appointment_id, amount, currency, method, status, reference, recorded_by)
         VALUES ($1, $2, $3, $4, $5, 'recorded', $6, $7)
         RETURNING id, appointment_id AS "appointmentId", amount::text AS amount, currency, method, status, reference, created_at AS "createdAt"`,
        [tenantId, id, amount, currency, method, reference ?? null, actor.id],
      );

      const movement = session
        ? await insertMovement(manager, {
            tenantId,
            sessionId: session.id,
            type: 'appointment',
            method,
            amount,
            currency,
            reference: reference ?? null,
            notes: `Cita: ${appt.service_name_snapshot ?? 'servicio'}`,
            actor,
            appointmentPaymentId: payment.id,
          })
        : null;

      const newBalance = balance - Number(amount);
      return {
        payment,
        cashMovementId: movement?.id ?? null,
        price: price.toFixed(2),
        paid: (Number(paid) + Number(amount)).toFixed(2),
        balance: Math.max(newBalance, 0).toFixed(2),
      };
    });
  }

  @Get(':id/payments')
  @Permissions('cash:read')
  @ApiOperation({ summary: 'Pagos de una cita y su saldo' })
  @ApiResponse({ status: 200, description: 'Pagos y saldo' })
  async getPayments(@RequestContext('tenantId') tenantId: string, @Param('id', new ParseUUIDPipe()) id: string) {
    const [appt] = await this.dataSource.query(`SELECT price_snapshot FROM appointments WHERE tenant_id = $1 AND id = $2`, [tenantId, id]);
    if (!appt) throw new NotFoundError('Cita no encontrada');
    const payments = await this.dataSource.query(
      `SELECT id, amount::text AS amount, currency, method, status, reference, created_at AS "createdAt"
         FROM appointment_payments WHERE tenant_id = $1 AND appointment_id = $2 ORDER BY created_at`,
      [tenantId, id],
    );
    const paid = payments.filter((p: { status: string }) => p.status === 'recorded').reduce((s: number, p: { amount: string }) => s + Number(p.amount), 0);
    const price = Number(appt.price_snapshot);
    return { payments, price: price.toFixed(2), paid: paid.toFixed(2), balance: Math.max(price - paid, 0).toFixed(2) };
  }
}
