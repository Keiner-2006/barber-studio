import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Makes the cash module usable:
 * - cash_sessions never existed (every cash endpoint failed with "relation does not exist")
 * - actor columns pointed to tenant-local users(id), but actors are Better Auth users → every insert failed the FK
 * - links appointment payments to the cash movement they produced
 * - gives every branch a default "Caja principal"
 * All tables involved were empty in production when this was written.
 */
export class CreateCashSessions1794200000000 implements MigrationInterface {
  name = 'CreateCashSessions1794200000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS public.cash_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL,
        cash_register_id uuid NOT NULL REFERENCES public.cash_registers(id),
        user_id uuid,
        user_name text,
        opened_at timestamptz NOT NULL DEFAULT now(),
        closed_at timestamptz,
        closed_by uuid,
        closed_by_name text,
        initial_balance numeric(12,2) NOT NULL DEFAULT 0 CHECK (initial_balance >= 0),
        expected_balance numeric(12,2),
        counted_balance numeric(12,2),
        difference numeric(12,2),
        currency text NOT NULL DEFAULT 'COP',
        is_open boolean NOT NULL DEFAULT true,
        notes text,
        version integer NOT NULL DEFAULT 1,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_cash_sessions_tenant_opened ON public.cash_sessions (tenant_id, opened_at DESC)`);
    // At most one open session per register, enforced by the database.
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_cash_sessions_one_open ON public.cash_sessions (cash_register_id) WHERE is_open`);

    await q.query(`ALTER TABLE public.cash_transactions DROP CONSTRAINT IF EXISTS cash_transactions_actor_id_fkey`);
    await q.query(`ALTER TABLE public.cash_transactions ALTER COLUMN actor_id DROP NOT NULL`);
    await q.query(`ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS actor_name text`);
    await q.query(`ALTER TABLE public.cash_transactions ADD COLUMN IF NOT EXISTS appointment_payment_id uuid REFERENCES public.appointment_payments(id)`);
    await q.query(`ALTER TABLE public.cash_transactions ADD CONSTRAINT cash_transactions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.cash_sessions(id)`);
    await q.query(`ALTER TABLE public.cash_transactions ADD CONSTRAINT cash_transactions_amount_positive CHECK (amount > 0)`);

    await q.query(`ALTER TABLE public.cash_registers DROP CONSTRAINT IF EXISTS cash_registers_opened_by_fkey`);
    await q.query(`ALTER TABLE public.cash_registers DROP CONSTRAINT IF EXISTS cash_registers_closed_by_fkey`);

    await q.query(`
      INSERT INTO public.cash_registers (tenant_id, branch_id, name, status, initial_balance)
      SELECT b.tenant_id, b.id, 'Caja principal', 'active', 0
        FROM public.branches b
       WHERE NOT EXISTS (SELECT 1 FROM public.cash_registers r WHERE r.branch_id = b.id)`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE public.cash_transactions DROP CONSTRAINT IF EXISTS cash_transactions_amount_positive`);
    await q.query(`ALTER TABLE public.cash_transactions DROP CONSTRAINT IF EXISTS cash_transactions_session_id_fkey`);
    await q.query(`ALTER TABLE public.cash_transactions DROP COLUMN IF EXISTS appointment_payment_id`);
    await q.query(`ALTER TABLE public.cash_transactions DROP COLUMN IF EXISTS actor_name`);
    await q.query(`DROP TABLE IF EXISTS public.cash_sessions`);
    // The users(id) FKs and NOT NULL on actor_id are not restored: they made every insert fail.
  }
}
