import { Controller, Get, Post, Query, Body, Inject, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { z } from 'zod';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';
import { ConflictError, NotFoundError, ValidationError } from '../../../../shared/errors/app-error';
import { SESSION_TOTALS_COLUMNS, SESSION_TOTALS_SQL, actorFrom, insertMovement, tenantCurrency } from '../../domain/cash-ledger';

const MONEY = z.string().trim().regex(/^\d{1,10}(\.\d{1,2})?$/, 'Monto inválido');
const POSITIVE_MONEY = MONEY.refine((v) => Number(v) > 0, 'El monto debe ser mayor que cero');

const transactionSchema = z
  .object({
    sessionId: z.string().uuid(),
    type: z.enum(['sale', 'expense', 'refund', 'adjustment']),
    method: z.enum(['cash', 'card_manual', 'transfer_manual', 'other']),
    amount: POSITIVE_MONEY,
    reference: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(300).optional(),
  })
  .refine((d) => d.type === 'sale' || !!d.notes, { message: 'Indica el concepto del movimiento', path: ['notes'] });

const SESSION_COLUMNS = `
  s.id, s.cash_register_id AS "cashRegisterId", r.name AS "cashRegisterName", r.branch_id AS "branchId",
  s.user_name AS "userName", s.opened_at AS "openedAt", s.closed_at AS "closedAt", s.closed_by_name AS "closedByName",
  s.initial_balance::text AS "initialBalance", s.expected_balance::text AS "expectedBalance",
  s.counted_balance::text AS "countedBalance", s.difference::text AS difference, s.currency, s.is_open AS "isOpen", s.notes`;

const SESSION_BY_ID = `
  SELECT ${SESSION_COLUMNS}, ${SESSION_TOTALS_COLUMNS}
    FROM cash_sessions s JOIN cash_registers r ON r.id = s.cash_register_id
    ${SESSION_TOTALS_SQL}
   WHERE s.id = $1`;

@ApiTags('cash')
@Controller('cash')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CashController {
  constructor(@Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource) {}

  @Get('registers')
  @Permissions('cash:read')
  @ApiOperation({ summary: 'Listar cajas con su sesión abierta' })
  async listRegisters(@RequestContext('tenantId') tenantId: string) {
    return this.dataSource.query(
      `SELECT r.id, r.branch_id AS "branchId", b.name AS "branchName", r.name, r.status, r.initial_balance::text AS "initialBalance",
              (SELECT s.id FROM cash_sessions s WHERE s.cash_register_id = r.id AND s.is_open LIMIT 1) AS "openSessionId"
         FROM cash_registers r JOIN branches b ON b.id = r.branch_id
        WHERE r.tenant_id = $1 ORDER BY b.name, r.created_at`,
      [tenantId],
    );
  }

  @Post('registers')
  @Permissions('branches:write')
  @ApiOperation({ summary: 'Crear una caja en una sede' })
  async createRegister(@RequestContext('tenantId') tenantId: string, @Body() body: unknown) {
    const parsed = z.object({ branchId: z.string().uuid(), name: z.string().trim().min(2).max(60) }).safeParse(body);
    if (!parsed.success) throw new ValidationError('Indica la sede y un nombre para la caja', parsed.error.flatten());
    const [branch] = await this.dataSource.query(`SELECT id FROM branches WHERE tenant_id = $1 AND id = $2`, [tenantId, parsed.data.branchId]);
    if (!branch) throw new NotFoundError('Sede no encontrada');
    const [register] = await this.dataSource.query(
      `INSERT INTO cash_registers (tenant_id, branch_id, name, status, initial_balance) VALUES ($1, $2, $3, 'active', 0)
       RETURNING id, branch_id AS "branchId", name, status, initial_balance::text AS "initialBalance"`,
      [tenantId, parsed.data.branchId, parsed.data.name],
    );
    return { ...register, openSessionId: null };
  }

  private async getSessions(tenantId: string, registerId: string | undefined, openOnly: boolean, limit: number) {
    const conditions = ['s.tenant_id = $1'];
    const params: unknown[] = [tenantId];
    if (registerId) {
      params.push(registerId);
      conditions.push(`s.cash_register_id = $${params.length}`);
    }
    if (openOnly) conditions.push('s.is_open');
    params.push(limit);
    return this.dataSource.query(
      `SELECT ${SESSION_COLUMNS}, ${SESSION_TOTALS_COLUMNS}
         FROM cash_sessions s
         JOIN cash_registers r ON r.id = s.cash_register_id AND r.tenant_id = s.tenant_id
         ${SESSION_TOTALS_SQL}
        WHERE ${conditions.join(' AND ')}
        ORDER BY s.is_open DESC, s.opened_at DESC
        LIMIT $${params.length}`,
      params,
    );
  }

  private async getTransactions(tenantId: string, sessionId: string) {
    return this.dataSource.query(
      `SELECT t.id, t.session_id AS "sessionId", t.type, t.method, t.amount::text AS amount, t.currency, t.reference, t.notes,
              t.actor_name AS "actorName", t.appointment_payment_id AS "appointmentPaymentId", t.created_at AS "createdAt"
         FROM cash_transactions t
        WHERE t.tenant_id = $1 AND t.session_id = $2 ORDER BY t.created_at DESC`,
      [tenantId, sessionId],
    );
  }

  @Get('sessions')
  @Permissions('cash:read')
  @ApiOperation({ summary: 'Listar sesiones (con totales) o los movimientos de una sesión' })
  async listSessions(
    @RequestContext('tenantId') tenantId: string,
    @Query('registerId') registerId?: string,
    @Query('openOnly') openOnly?: string,
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: string,
  ) {
    if (sessionId) return this.getTransactions(tenantId, sessionId);
    const take = Math.min(Math.max(parseInt(limit ?? '30', 10) || 30, 1), 200);
    return this.getSessions(tenantId, registerId, openOnly === 'true', take);
  }

  @Get()
  @Permissions('cash:read')
  @ApiOperation({ summary: 'Listar movimientos de una sesión' })
  async listTransactions(@RequestContext('tenantId') tenantId: string, @Query('sessionId') sessionId?: string) {
    if (!sessionId) throw new ValidationError('sessionId es requerido');
    return this.getTransactions(tenantId, sessionId);
  }

  @Post()
  @Permissions('cash:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Abrir/cerrar sesión o registrar movimiento de caja' })
  async mutate(@RequestContext('tenantId') tenantId: string, @Body() body: unknown, @Req() req: Request) {
    const action = z.object({ action: z.enum(['open', 'close', 'transaction']) }).safeParse(body);
    if (!action.success) throw new ValidationError('Acción no válida');
    const data = body as Record<string, unknown>;
    const actor = actorFrom(req);

    if (action.data.action === 'open') {
      const parsed = z.object({ cashRegisterId: z.string().uuid(), initialBalance: MONEY }).safeParse(data);
      if (!parsed.success) throw new ValidationError('Indica la base inicial de la caja', parsed.error.flatten());
      return this.dataSource.transaction(async (manager) => {
        const [register] = await manager.query(
          `SELECT id, status FROM cash_registers WHERE tenant_id = $1 AND id = $2 FOR UPDATE`,
          [tenantId, parsed.data.cashRegisterId],
        );
        if (!register) throw new NotFoundError('Caja no encontrada');
        if (register.status !== 'active') throw new ConflictError('Esta caja está desactivada');
        const [existing] = await manager.query(`SELECT id FROM cash_sessions WHERE cash_register_id = $1 AND is_open`, [register.id]);
        if (existing) throw new ConflictError('Esta caja ya está abierta');
        const currency = await tenantCurrency(manager, tenantId);
        const [session] = await manager.query(
          `INSERT INTO cash_sessions (tenant_id, cash_register_id, user_id, user_name, initial_balance, currency, is_open)
           VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`,
          [tenantId, register.id, actor.id, actor.name, parsed.data.initialBalance, currency],
        );
        const [full] = await manager.query(SESSION_BY_ID, [session.id]);
        return full;
      });
    }

    if (action.data.action === 'close') {
      const parsed = z
        .object({ sessionId: z.string().uuid(), countedBalance: MONEY, notes: z.string().trim().max(300).optional() })
        .safeParse(data);
      if (!parsed.success) throw new ValidationError('Indica el efectivo contado', parsed.error.flatten());
      return this.dataSource.transaction(async (manager) => {
        const [session] = await manager.query(
          `SELECT id FROM cash_sessions WHERE tenant_id = $1 AND id = $2 AND is_open FOR UPDATE`,
          [tenantId, parsed.data.sessionId],
        );
        if (!session) throw new NotFoundError('La sesión no existe o ya está cerrada');
        const [calc] = await manager.query(
          `SELECT (s.initial_balance + tot.cash_in - tot.cash_out) AS expected FROM cash_sessions s ${SESSION_TOTALS_SQL} WHERE s.id = $1`,
          [session.id],
        );
        const expected = Number(calc.expected);
        const difference = Number(parsed.data.countedBalance) - expected;
        await manager.query(
          `UPDATE cash_sessions SET is_open = false, closed_at = now(), closed_by = $2, closed_by_name = $3,
                  expected_balance = $4, counted_balance = $5, difference = $6, notes = $7, version = version + 1, updated_at = now()
            WHERE id = $1`,
          [session.id, actor.id, actor.name, expected.toFixed(2), parsed.data.countedBalance, difference.toFixed(2), parsed.data.notes ?? null],
        );
        const [full] = await manager.query(SESSION_BY_ID, [session.id]);
        return full;
      });
    }

    const parsed = transactionSchema.safeParse(data);
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? 'Datos inválidos', parsed.error.flatten());
    const [session] = await this.dataSource.query(
      `SELECT id, currency FROM cash_sessions WHERE tenant_id = $1 AND id = $2 AND is_open`,
      [tenantId, parsed.data.sessionId],
    );
    if (!session) throw new NotFoundError('La caja está cerrada. Ábrela para registrar movimientos.');
    return insertMovement(this.dataSource, {
      tenantId,
      sessionId: session.id,
      type: parsed.data.type,
      method: parsed.data.method,
      amount: parsed.data.amount,
      currency: session.currency,
      reference: parsed.data.reference,
      notes: parsed.data.notes,
      actor,
    });
  }
}
