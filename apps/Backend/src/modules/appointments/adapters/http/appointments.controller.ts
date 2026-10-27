import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetAppointmentsUseCase } from '../../domain/use-cases/get-appointments.use-case';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { Inject } from '@nestjs/common';
import type { IAppointmentRepository } from '../../domain/appointment.domain';
import type { IAppointmentPaymentRepository } from '../../domain/appointment.domain';
import { z } from 'zod';

const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  staffId: z.string().uuid().optional(),
});

const appointmentPaymentSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).transform((val) => parseFloat(val)),
  currency: z.string().default('MXN'),
  method: z.enum(['cash', 'card_manual', 'transfer_manual', 'other']),
  status: z.enum(['pending', 'recorded', 'refunded', 'voided']).optional(),
  reference: z.string().optional(),
});

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(
    private readonly getAppointmentsUseCase: GetAppointmentsUseCase,
    @Inject('IAppointmentRepository') private readonly appointmentRepo: IAppointmentRepository,
    @Inject('IAppointmentPaymentRepository') private readonly appointmentPaymentRepo: IAppointmentPaymentRepository,
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
  ) {
    const appointments = await this.getAppointmentsUseCase.execute(tenantId, {
      branchId,
      customerId,
      staffId,
      status: status as any,
      startsAtFrom: startsAtFrom ? new Date(startsAtFrom) : undefined,
      startsAtTo: startsAtTo ? new Date(startsAtTo) : undefined,
    });
    return { data: appointments.map((a) => a.toPlain()) };
  }

  @Patch(':id')
  @Permissions('appointments:write')
  @ApiOperation({ summary: 'Actualizar cita (cambiar estado, etc.)' })
  @ApiResponse({ status: 200, description: 'Cita actualizada' })
  async updateAppointment(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = updateAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() } };
    }

    const appointment = await this.appointmentRepo.findById(tenantId, id);
    if (!appointment) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Cita no encontrada' } };
    }

    const updated = await this.appointmentRepo.update(tenantId, id, {
      status: parsed.data.status as any,
      notes: parsed.data.notes,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : undefined,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
      staffId: parsed.data.staffId,
    } as any);

    if (!updated) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Cita no encontrada' } };
    }
    return { data: updated.toPlain() };
  }

  @Post(':id/payments')
  @Permissions('appointments:write')
  @ApiOperation({ summary: 'Registrar pago de cita' })
  @ApiResponse({ status: 201, description: 'Pago registrado' })
  async recordPayment(
    @RequestContext('tenantId') tenantId: string,
    @RequestContext('userId') userId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = appointmentPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() } };
    }

    const appointment = await this.appointmentRepo.findById(tenantId, id);
    if (!appointment) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Cita no encontrada' } };
    }

    const payment = await this.appointmentPaymentRepo.create(tenantId, {
      appointmentId: id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      method: parsed.data.method,
      status: parsed.data.status || 'recorded',
      reference: parsed.data.reference,
      recordedBy: userId,
    });

    return { data: payment.toPlain() };
  }

  @Get(':id/payments')
  @Permissions('appointments:read')
  @ApiOperation({ summary: 'Listar pagos de una cita' })
  @ApiResponse({ status: 200, description: 'Lista de pagos' })
  async getPayments(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const payments = await this.appointmentPaymentRepo.findByAppointmentId(tenantId, id);
    return { data: payments.map((p) => p.toPlain()) };
  }
}
