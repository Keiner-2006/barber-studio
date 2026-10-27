import { Controller, Get, Post, Query, Body, Inject, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { z } from 'zod';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';
import { ConflictError, NotFoundError, ValidationError } from '../../../../shared/errors/app-error';

const transactionSchema = z.object({
  type: z.enum(['sale', 'appointment', 'expense', 'refund', 'adjustment']),
  method: z.enum(['cash', 'card_manual', 'transfer_manual', 'other']),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

@ApiTags('cash')
@Controller('cash')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CashController {
  constructor(@Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource) {}

  @Get('registers')
  @Permissions('cash:read')
  @ApiOperation({ summary: 'Listar cajas registradoras' })
  async listRegisters(@RequestContext('tenantId') tenantId: string) {
    const rows = await this.dataSource.query(
      `SELECT id, branch_id AS "branchId", name, status, initial_balance AS "initialBalance"
         FROM cash_registers WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId],
    );
    return { data: rows };
  }

  private async getSessions(tenantId: string, registerId?: string, openOnly = false) {
    const conditions = ['s.tenant_id = $1'];
    const parameters: unknown[] = [tenantId];
    if (registerId) {
      parameters.push(registerId);
      conditions.push(`s.cash_register_id = $${parameters.length}`);
    }
    if (openOnly) conditions.push('s.is_open = true');
    return this.dataSource.query(
      `SELECT s.id, s.cash_register_id AS "cashRegisterId", r.name AS "cashRegisterName",
              s.user_id AS "userId", u.name AS "userName", s.opened_at AS "openedAt",
              s.closed_at AS "closedAt", s.initial_balance AS "initialBalance",
              s.expected_balance AS "expectedBalance", s.counted_balance AS "countedBalance",
              s.difference, s.currency, s.is_open AS "isOpen"
         FROM cash_sessions s
         INNER JOIN cash_registers r ON r.id = s.cash_register_id AND r.tenant_id = s.tenant_id
         LEFT JOIN users u ON u.id = s.user_id
        WHERE ${conditions.join(' AND ')} ORDER BY s.opened_at DESC`,
      parameters,
    );
  }

  private async getTransactions(tenantId: string, sessionId: string) {
    return this.dataSource.query(
      `SELECT t.id, t.session_id AS "sessionId", t.type, t.method, t.amount::text AS amount,
              t.currency, t.reference, t.notes, t.actor_id AS "actorId", u.name AS "actorName",
              t.created_at AS "createdAt",
              COALESCE(t.notes, initcap(replace(t.type::text, '_', ' '))) AS concept,
              CASE t.method WHEN 'card_manual' THEN 'Tarjeta' WHEN 'transfer_manual' THEN 'Transferencia'
                    WHEN 'cash' THEN 'Efectivo' ELSE 'Otro' END AS "methodLabel"
         FROM cash_transactions t
         LEFT JOIN users u ON u.id = t.actor_id
        WHERE t.tenant_id = $1 AND t.session_id = $2 ORDER BY t.created_at DESC`,
      [tenantId, sessionId],
    );
  }

  @Get('sessions')
  @Permissions('cash:read')
  @ApiOperation({ summary: 'Listar sesiones o sus movimientos' })
  async listSessions(
    @RequestContext('tenantId') tenantId: string,
    @Query('registerId') registerId?: string,
    @Query('openOnly') openOnly?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    if (sessionId) return { data: await this.getTransactions(tenantId, sessionId) };
    return { data: await this.getSessions(tenantId, registerId, openOnly === 'true') };
  }

  @Get()
  @Permissions('cash:read')
  @ApiOperation({ summary: 'Listar movimientos de una sesión' })
  async listTransactions(@RequestContext('tenantId') tenantId: string, @Query('sessionId') sessionId?: string) {
    if (!sessionId) throw new ValidationError('sessionId es requerido');
    return { data: await this.getTransactions(tenantId, sessionId) };
  }

  @Post()
  @Permissions('cash:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Abrir/cerrar sesión o registrar movimiento de caja' })
  async mutate(
    @RequestContext('tenantId') tenantId: string,
    @RequestContext('userId') userId: string,
    @Body() body: unknown,
  ) {
    const action = z.object({ action: z.enum(['open', 'close', 'transaction']) }).safeParse(body);
    if (!action.success || typeof body !== 'object' || body === null) throw new ValidationError('Acción no válida');
    const data = body as Record<string, unknown>;

    if (action.data.action === 'open') {
      const parsed = z.object({ cashRegisterId: z.string().uuid(), initialBalance: z.string().regex(/^\d+(\.\d{1,2})?$/) }).safeParse(data);
      if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
      return this.dataSource.transaction(async (manager) => {
        const [register] = await manager.query(
          'SELECT id FROM cash_registers WHERE tenant_id = $1 AND id = $2 FOR UPDATE',
          [tenantId, parsed.data.cashRegisterId],
        );
        if (!register) throw new NotFoundError('Caja no encontrada');
        const [existing] = await manager.query(
          'SELECT id FROM cash_sessions WHERE tenant_id = $1 AND cash_register_id = $2 AND is_open = true',
          [tenantId, parsed.data.cashRegisterId],
        );
        if (existing) throw new ConflictError('Ya hay una sesión abierta para esta caja');
        const [session] = await manager.query(
          `INSERT INTO cash_sessions (tenant_id, cash_register_id, user_id, initial_balance, currency, is_open)
           VALUES ($1, $2, $3, $4, 'MXN', true)
           RETURNING id, cash_register_id AS "cashRegisterId", user_id AS "userId", opened_at AS "openedAt",
                     initial_balance AS "initialBalance", expected_balance AS "expectedBalance",
                     counted_balance AS "countedBalance", difference, currency, is_open AS "isOpen"`,
          [tenantId, parsed.data.cashRegisterId, userId, parsed.data.initialBalance],
        );
        return { data: session };
      });
    }

    if (action.data.action === 'close') {
      const parsed = z.object({ sessionId: z.string().uuid(), countedBalance: z.string().regex(/^\d+(\.\d{1,2})?$/) }).safeParse(data);
      if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
      return this.dataSource.transaction(async (manager) => {
        const [session] = await manager.query(
          'SELECT * FROM cash_sessions WHERE tenant_id = $1 AND id = $2 AND is_open = true FOR UPDATE',
          [tenantId, parsed.data.sessionId],
        );
        if (!session) throw new NotFoundError('Sesión no encontrada o ya cerrada');
        const [totals] = await manager.query(
          `SELECT COALESCE(SUM(CASE WHEN type IN ('sale', 'appointment') THEN amount
                                    WHEN type IN ('expense', 'refund') THEN -amount ELSE 0 END), 0)::text AS expected
             FROM cash_transactions WHERE tenant_id = $1 AND session_id = $2`,
          [tenantId, session.id],
        );
        const expected = Number(session.initial_balance) + Number(totals.expected);
        const difference = Number(parsed.data.countedBalance) - expected;
        const [closed] = await manager.query(
          `UPDATE cash_sessions SET is_open = false, closed_at = now(), expected_balance = $3,
                  counted_balance = $4, difference = $5, version = version + 1
            WHERE tenant_id = $1 AND id = $2 AND is_open = true
            RETURNING id, cash_register_id AS "cashRegisterId", user_id AS "userId", opened_at AS "openedAt",
                      closed_at AS "closedAt", initial_balance AS "initialBalance", expected_balance AS "expectedBalance",
                      counted_balance AS "countedBalance", difference, currency, is_open AS "isOpen"`,
          [tenantId, session.id, expected.toFixed(2), parsed.data.countedBalance, difference.toFixed(2)],
        );
        return { data: closed };
      });
    }

    const parsed = transactionSchema.extend({ sessionId: z.string().uuid() }).safeParse(data);
    if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
    const [session] = await this.dataSource.query(
      'SELECT id, currency FROM cash_sessions WHERE tenant_id = $1 AND id = $2 AND is_open = true',
      [tenantId, parsed.data.sessionId],
    );
    if (!session) throw new NotFoundError('Sesión no encontrada o ya cerrada');
    const [transaction] = await this.dataSource.query(
      `INSERT INTO cash_transactions (tenant_id, session_id, type, method, amount, currency, reference, notes, actor_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, session_id AS "sessionId", type, method, amount::text AS amount, currency,
                 reference, notes, actor_id AS "actorId", created_at AS "createdAt"`,
      [tenantId, session.id, parsed.data.type, parsed.data.method, parsed.data.amount, session.currency,
        parsed.data.reference ?? null, parsed.data.notes ?? null, userId],
    );
    return { data: transaction };
  }
}
