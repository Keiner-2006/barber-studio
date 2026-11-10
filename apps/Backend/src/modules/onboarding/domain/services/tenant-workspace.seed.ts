import { EntityManager } from 'typeorm';

export interface WorkspaceSeedInput {
  tenantId: string;
  slug: string;
  tradeName: string;
  countryCode: string;
  timezone: string;
  currencyCode: string;
  location?: { city?: string | null; neighborhood?: string | null; address?: string | null; whatsapp?: string | null } | null;
  schedules?: unknown;
  services?: unknown;
}

const DAY_KEYS: Record<string, string[]> = {
  'lunes a viernes': ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  'lunes a sabado': ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
  sabados: ['sabado'],
  sabado: ['sabado'],
  'domingos & festivos': ['domingo'],
  domingos: ['domingo'],
  domingo: ['domingo'],
};

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
const isTime = (v: unknown): v is string => typeof v === 'string' && /^\d{2}:\d{2}$/.test(v);

/** Onboarding ranges ("Lunes a Viernes" 08:00–20:00) → branch operating_hours ({ lunes: "08:00-20:00", ... }). */
export function toOperatingHours(schedules: unknown): Record<string, string> | null {
  if (!Array.isArray(schedules)) return null;
  const hours: Record<string, string> = {};
  for (const range of schedules as Array<Record<string, unknown>>) {
    if (!range?.active || !isTime(range.open) || !isTime(range.close) || typeof range.days !== 'string') continue;
    for (const day of DAY_KEYS[normalize(range.days)] ?? []) hours[day] = `${range.open}-${range.close}`;
  }
  return Object.keys(hours).length ? hours : null;
}

/** Selected onboarding services → rows ready to insert ("45 min" → 45). Invalid items are skipped. */
export function toServiceRows(services: unknown): Array<{ name: string; description: string | null; durationMinutes: number; price: number }> {
  if (!Array.isArray(services)) return [];
  return (services as Array<Record<string, unknown>>)
    .filter((s) => s?.selected !== false && typeof s?.name === 'string' && s.name.trim())
    .map((s) => ({
      name: String(s.name).trim().slice(0, 150),
      description: typeof s.description === 'string' && s.description.trim() ? s.description.trim().slice(0, 500) : null,
      durationMinutes: Math.min(Math.max(parseInt(String(s.duration ?? ''), 10) || 30, 5), 600),
      price: Math.max(Number(s.price) || 0, 0),
    }))
    .slice(0, 50);
}

/**
 * Creates the first branch, a default service category and the selected services for a new tenant,
 * inside the caller's transaction. Raw SQL on purpose: these tables belong to the platform data source,
 * and the onboarding transaction runs on the auth data source (same database).
 */
export async function seedTenantWorkspace(manager: EntityManager, input: WorkspaceSeedInput): Promise<{ branchId: string; servicesCreated: number }> {
  const loc = input.location ?? {};
  const [branch] = await manager.query(
    `insert into branches (tenant_id, name, code, address, city, state, country, phone, timezone, status, operating_hours)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10) returning id`,
    [
      input.tenantId,
      input.tradeName,
      `${input.slug}-01`.toUpperCase(),
      [loc.address, loc.neighborhood].filter(Boolean).join(', ') || null,
      loc.city || null,
      loc.neighborhood || null,
      input.countryCode,
      loc.whatsapp || null,
      input.timezone,
      JSON.stringify(toOperatingHours(input.schedules)),
    ],
  );

  await manager.query(
    `insert into cash_registers (tenant_id, branch_id, name, status, initial_balance) values ($1, $2, 'Caja principal', 'active', 0)`,
    [input.tenantId, branch.id],
  );

  const rows = toServiceRows(input.services);
  if (rows.length) {
    const [category] = await manager.query(
      `insert into service_categories (tenant_id, name, display_order, active) values ($1, 'Servicios', 0, true) returning id`,
      [input.tenantId],
    );
    for (const s of rows) {
      await manager.query(
        `insert into services (tenant_id, category_id, name, description, duration_minutes, price_base, currency, payment_policy, active)
         values ($1, $2, $3, $4, $5, $6, $7, 'none', true)`,
        [input.tenantId, category.id, s.name, s.description, s.durationMinutes, s.price, input.currencyCode],
      );
    }
  }
  return { branchId: branch.id, servicesCreated: rows.length };
}
