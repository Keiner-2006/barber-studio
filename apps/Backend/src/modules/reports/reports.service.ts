import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PLATFORM_DATA_SOURCE } from '../../shared/db/database.module';

@Injectable()
export class ReportsService {
  constructor(@Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource) {}

  private appointmentFilters(tenantId: string, from?: Date, to?: Date) {
    const conditions = ['a.tenant_id = $1'];
    const parameters: unknown[] = [tenantId];
    if (from) {
      parameters.push(from);
      conditions.push(`a.starts_at >= $${parameters.length}`);
    }
    if (to) {
      parameters.push(to);
      conditions.push(`a.starts_at <= $${parameters.length}`);
    }
    return { conditions: conditions.join(' AND '), parameters };
  }

  async getSales(tenantId: string, from?: Date, to?: Date) {
    const filters = this.appointmentFilters(tenantId, from, to);
    return this.dataSource.query(
      `SELECT to_char(a.starts_at, 'YYYY-MM-DD') AS date,
              COALESCE(SUM(CASE WHEN p.status = 'recorded' THEN p.amount ELSE 0 END), 0)::text AS "totalSales",
              COUNT(a.id)::int AS "totalOrders",
              COALESCE(AVG(p.amount), 0)::text AS "averageTicket",
              COALESCE(MAX(p.currency), 'MXN') AS currency
         FROM appointments a
         INNER JOIN appointment_payments p ON p.appointment_id = a.id AND p.tenant_id = a.tenant_id
        WHERE ${filters.conditions}
        GROUP BY to_char(a.starts_at, 'YYYY-MM-DD')
        ORDER BY date`,
      filters.parameters,
    );
  }

  async getCash(tenantId: string, from?: Date, to?: Date) {
    const conditions = ['s.tenant_id = $1', 's.is_open = false'];
    const parameters: unknown[] = [tenantId];
    if (from) {
      parameters.push(from);
      conditions.push(`s.closed_at >= $${parameters.length}`);
    }
    if (to) {
      parameters.push(to);
      conditions.push(`s.closed_at <= $${parameters.length}`);
    }
    return this.dataSource.query(
      `SELECT to_char(s.closed_at, 'YYYY-MM-DD') AS date,
              COALESCE(SUM(CASE WHEN t.type IN ('sale', 'appointment') THEN t.amount ELSE 0 END), 0)::text AS sales,
              COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::text AS expenses,
              COALESCE(SUM(CASE WHEN t.type = 'refund' THEN t.amount ELSE 0 END), 0)::text AS refunds,
              COALESCE(SUM(CASE WHEN t.type IN ('sale', 'appointment') THEN t.amount WHEN t.type IN ('expense', 'refund') THEN -t.amount ELSE 0 END), 0)::text AS net,
              COALESCE(MAX(s.currency), 'MXN') AS currency
         FROM cash_sessions s
         INNER JOIN cash_registers r ON r.id = s.cash_register_id AND r.tenant_id = s.tenant_id
         LEFT JOIN cash_transactions t ON t.session_id = s.id AND t.tenant_id = s.tenant_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY to_char(s.closed_at, 'YYYY-MM-DD')
        ORDER BY date`,
      parameters,
    );
  }

  async getInventory(tenantId: string) {
    return this.dataSource.query(
      `SELECT p.id, p.name, p.sku,
              COALESCE(SUM(bi.quantity), 0)::numeric AS "currentStock",
              p.min_quantity AS "minStock", p.unit_cost AS "unitCost",
              COALESCE(SUM(bi.quantity * p.unit_cost), 0)::text AS "totalValue",
              'MXN'::text AS currency
         FROM products p
         LEFT JOIN branch_inventory bi ON bi.product_id = p.id AND bi.tenant_id = p.tenant_id
        WHERE p.tenant_id = $1 AND p.active = true
        GROUP BY p.id, p.name, p.sku, p.min_quantity, p.unit_cost
        ORDER BY p.name`,
      [tenantId],
    );
  }

  async getOccupancy(tenantId: string, from?: Date, to?: Date) {
    const filters = this.appointmentFilters(tenantId, from, to);
    return this.dataSource.query(
      `SELECT to_char(a.starts_at, 'YYYY-MM-DD') AS date,
              GREATEST(COUNT(a.id)::int, 1) AS "totalSlots",
              COUNT(a.id)::int AS "occupiedSlots",
              1::numeric AS "occupancyRate"
         FROM appointments a
        WHERE ${filters.conditions}
        GROUP BY to_char(a.starts_at, 'YYYY-MM-DD')
        ORDER BY date`,
      filters.parameters,
    );
  }

  async getServices(tenantId: string, from?: Date, to?: Date) {
    const filters = this.appointmentFilters(tenantId, from, to);
    return this.dataSource.query(
      `SELECT s.id, a.service_name_snapshot AS name,
              COALESCE(SUM(CASE WHEN p.status = 'recorded' THEN p.amount ELSE 0 END), 0)::text AS "totalSales",
              COUNT(a.id)::int AS quantity, COALESCE(MAX(p.currency), 'MXN') AS currency
         FROM appointments a
         INNER JOIN appointment_payments p ON p.appointment_id = a.id AND p.tenant_id = a.tenant_id
         INNER JOIN services s ON s.id = a.service_id AND s.tenant_id = a.tenant_id
        WHERE ${filters.conditions}
        GROUP BY s.id, a.service_name_snapshot
        ORDER BY SUM(p.amount) DESC`,
      filters.parameters,
    );
  }
}
