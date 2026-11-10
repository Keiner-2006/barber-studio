import type { EntityManager, DataSource } from 'typeorm';

type Db = EntityManager | DataSource;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Who is acting, from the authenticated request (Better Auth session user). */
export function actorFrom(req: unknown): { id: string | null; name: string | null } {
  const user = (req as { user?: { id?: string; name?: string; email?: string } })?.user;
  return {
    id: user?.id && UUID_RE.test(user.id) ? user.id : null,
    name: user?.name || user?.email || null,
  };
}

export async function tenantCurrency(db: Db, tenantId: string): Promise<string> {
  const [row] = await db.query(`SELECT currency_code FROM platform_tenants WHERE id = $1`, [tenantId]);
  return row?.currency_code || 'COP';
}

/** The open cash session of a branch (oldest first if, unusually, several registers are open). */
export async function openSessionForBranch(db: Db, tenantId: string, branchId: string): Promise<{ id: string; currency: string } | null> {
  const [row] = await db.query(
    `SELECT s.id, s.currency FROM cash_sessions s
       JOIN cash_registers r ON r.id = s.cash_register_id AND r.tenant_id = s.tenant_id
      WHERE s.tenant_id = $1 AND r.branch_id = $2 AND s.is_open
      ORDER BY s.opened_at LIMIT 1`,
    [tenantId, branchId],
  );
  return row ?? null;
}

export type MovementType = 'sale' | 'appointment' | 'expense' | 'refund' | 'adjustment';
export type PaymentMethod = 'cash' | 'card_manual' | 'transfer_manual' | 'other';

export async function insertMovement(
  db: Db,
  m: {
    tenantId: string;
    sessionId: string;
    type: MovementType;
    method: PaymentMethod;
    amount: string;
    currency: string;
    reference?: string | null;
    notes?: string | null;
    actor: { id: string | null; name: string | null };
    appointmentPaymentId?: string | null;
  },
) {
  const [row] = await db.query(
    `INSERT INTO cash_transactions (tenant_id, session_id, type, method, amount, currency, reference, notes, actor_id, actor_name, appointment_payment_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, session_id AS "sessionId", type, method, amount::text AS amount, currency, reference, notes,
               actor_name AS "actorName", appointment_payment_id AS "appointmentPaymentId", created_at AS "createdAt"`,
    [m.tenantId, m.sessionId, m.type, m.method, m.amount, m.currency, m.reference ?? null, m.notes ?? null, m.actor.id, m.actor.name, m.appointmentPaymentId ?? null],
  );
  return row;
}

/**
 * Cash-drawer arithmetic. Only CASH movements change what should be in the drawer:
 * card/transfer income is reported but never counted. sale/appointment/adjustment add, expense/refund subtract.
 */
export const SESSION_TOTALS_SQL = `
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(t.amount) FILTER (WHERE t.method = 'cash' AND t.type IN ('sale', 'appointment', 'adjustment')), 0) AS cash_in,
      COALESCE(SUM(t.amount) FILTER (WHERE t.method = 'cash' AND t.type IN ('expense', 'refund')), 0) AS cash_out,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type IN ('sale', 'appointment')), 0) AS income,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type IN ('sale', 'appointment') AND t.method = 'cash'), 0) AS income_cash,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type IN ('sale', 'appointment') AND t.method = 'card_manual'), 0) AS income_card,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type IN ('sale', 'appointment') AND t.method = 'transfer_manual'), 0) AS income_transfer,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type IN ('sale', 'appointment') AND t.method = 'other'), 0) AS income_other,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0) AS expenses,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'refund'), 0) AS refunds,
      COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'adjustment'), 0) AS adjustments,
      COUNT(t.id)::int AS movements
    FROM cash_transactions t
    WHERE t.session_id = s.id AND t.tenant_id = s.tenant_id
  ) tot ON true`;

export const SESSION_TOTALS_COLUMNS = `
  json_build_object(
    'cashIn', tot.cash_in::text, 'cashOut', tot.cash_out::text,
    'expectedCash', (s.initial_balance + tot.cash_in - tot.cash_out)::text,
    'income', tot.income::text, 'incomeCash', tot.income_cash::text, 'incomeCard', tot.income_card::text,
    'incomeTransfer', tot.income_transfer::text, 'incomeOther', tot.income_other::text,
    'expenses', tot.expenses::text, 'refunds', tot.refunds::text, 'adjustments', tot.adjustments::text,
    'movements', tot.movements
  ) AS totals`;
