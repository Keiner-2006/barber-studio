import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { PlatformAdminApi, tenantsToCsv } from './platform-admin.api';
import {
  AdminTenantsPayload,
  CountrySlice,
  DEFAULT_TENANT_FILTERS,
  Pagination,
  PlatformMetrics,
  PlatformTenant,
  STATUS_BAR_CLASSES,
  STATUS_TEXT_CLASSES,
  StatusSlice,
  TenantFilters,
  TenantStatus,
  TenantViewMode,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_ORDER,
} from './platform-admin.models';

const EMPTY_METRICS: PlatformMetrics = {
  totalTenants: 0,
  activeTenants: 0,
  provisioningTenants: 0,
  suspendedTenants: 0,
  deletingTenants: 0,
  deletedTenants: 0,
  activeRatio: 0,
  isEmpty: true,
};

@Injectable({ providedIn: 'root' })
export class PlatformAdminStore {
  private api = inject(PlatformAdminApi);
  private auth = inject(AuthService);
  private loaded = false;

  readonly tenants = signal<PlatformTenant[]>([]);
  readonly countsByStatus = signal<Partial<Record<TenantStatus, number>>>({});
  readonly totalTenants = signal<number | null>(null);
  readonly lastSyncedAt = signal<Date | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  /** The platform API is unreachable (demo/offline): the UI must show an empty state, never fake numbers. */
  readonly offline = signal(false);

  readonly filters = signal<TenantFilters>({ ...DEFAULT_TENANT_FILTERS });
  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly viewMode = signal<TenantViewMode>('table');

  readonly viewer = computed(() => this.auth.user());

  readonly search = computed(() => this.filters().search.trim().toLowerCase());
  readonly statusFilter = computed(() => this.filters().status);
  readonly countryFilter = computed(() => this.filters().country);

  readonly filteredTenants = computed(() => {
    const term = this.search();
    const status = this.statusFilter();
    const country = this.countryFilter();

    return this.tenants().filter((tenant) => {
      if (status && tenant.status !== status) return false;
      if (country && tenant.countryCode?.toUpperCase() !== country) return false;
      if (!term) return true;
      return [tenant.tradeName, tenant.legalName, tenant.slug, tenant.countryCode, tenant.phone ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  });

  readonly pagination = computed<Pagination>(() => {
    const total = this.filteredTenants().length;
    const pageSize = this.pageSize();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, this.page()), totalPages);
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    return {
      page,
      pageSize,
      total,
      totalPages,
      from,
      to: Math.min(from + pageSize - 1, total),
    };
  });

  readonly pagedTenants = computed(() => {
    const { page, pageSize } = this.pagination();
    return this.filteredTenants().slice((page - 1) * pageSize, page * pageSize);
  });

  readonly metrics = computed<PlatformMetrics>(() => {
    const counts = this.countsByStatus();
    const totalTenants = this.totalTenants();
    if (totalTenants === null) return EMPTY_METRICS;

    const activeTenants = counts.active ?? 0;
    return {
      totalTenants,
      activeTenants,
      provisioningTenants: counts.provisioning ?? 0,
      suspendedTenants: counts.suspended ?? 0,
      deletingTenants: counts.deleting ?? 0,
      deletedTenants: counts.deleted ?? 0,
      activeRatio: totalTenants > 0 ? activeTenants / totalTenants : 0,
      isEmpty: totalTenants === 0,
    };
  });

  /** Real data for the dashboard chart: countsByStatus, never a static series. */
  readonly statusDistribution = computed<StatusSlice[]>(() => {
    const metrics = this.metrics();
    const counts = this.countsByStatus();
    return TENANT_STATUS_ORDER.map((status) => {
      const count = counts[status] ?? 0;
      return {
        status,
        label: TENANT_STATUS_LABELS[status],
        count,
        ratio: metrics.totalTenants > 0 ? count / metrics.totalTenants : 0,
        barClass: STATUS_BAR_CLASSES[status],
        textClass: STATUS_TEXT_CLASSES[status],
      };
    });
  });

  readonly provisioningQueue = computed(() =>
    this.tenants()
      .filter((tenant) => tenant.status === 'provisioning')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  );

  readonly suspendedTenants = computed(() =>
    this.tenants().filter((tenant) => tenant.status === 'suspended')
  );

  readonly recentTenants = computed(() =>
    [...this.tenants()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  );

  readonly countryDistribution = computed<CountrySlice[]>(() => {
    const list = this.tenants();
    if (list.length === 0) return [];
    const counter = new Map<string, number>();
    for (const tenant of list) {
      const code = (tenant.countryCode || '—').toUpperCase();
      counter.set(code, (counter.get(code) ?? 0) + 1);
    }
    return [...counter.entries()]
      .map(([code, count]) => ({ code, count, ratio: count / list.length }))
      .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
  });

  readonly countryOptions = computed(() => this.countryDistribution().map((slice) => slice.code));

  readonly hasActiveFilters = computed(
    () => !!this.search() || !!this.statusFilter() || !!this.countryFilter()
  );

  setSearch(search: string): void {
    this.filters.update((filters) => ({ ...filters, search }));
    this.page.set(1);
  }

  setStatusFilter(status: TenantStatus | null): void {
    this.filters.update((filters) => ({ ...filters, status }));
    this.page.set(1);
  }

  setCountryFilter(country: string | null): void {
    this.filters.update((filters) => ({ ...filters, country }));
    this.page.set(1);
  }

  setPage(page: number): void {
    const { totalPages } = this.pagination();
    this.page.set(Math.min(Math.max(1, page), totalPages));
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.page.set(1);
  }

  setViewMode(mode: TenantViewMode): void {
    this.viewMode.set(mode);
  }

  clearFilters(): void {
    this.filters.set({ ...DEFAULT_TENANT_FILTERS });
    this.page.set(1);
  }

  clearError(): void {
    this.error.set(null);
  }

  tenantById(id: string): PlatformTenant | null {
    return this.tenants().find((tenant) => tenant.id === id) ?? null;
  }

  statusLabel(status: TenantStatus): string {
    return TENANT_STATUS_LABELS[status];
  }

  /**
   * Loads the tenant catalogue. The API caps the page at `limit` tenants, and the
   * status/country/search facets are applied client-side over that window so the
   * `countsByStatus` totals always stay consistent with the full platform.
   */
  load(force = false): void {
    if (this.loading()) return;
    if (!force && this.loaded) return;

    if (environment.demoAuth && !environment.production) {
      this.tenants.set([]);
      this.countsByStatus.set({});
      this.totalTenants.set(null);
      this.offline.set(true);
      this.loaded = true;
      this.error.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api
      .getTenants({ limit: this.filters().limit })
      .pipe(
        tap((response) => {
          this.applyPayload(response.data);
          this.offline.set(false);
          this.loaded = true;
        }),
        catchError((err: unknown) => {
          this.offline.set(true);
          this.loaded = true;
          this.error.set(toMessage(err));
          this.tenants.set([]);
          this.countsByStatus.set({});
          this.totalTenants.set(null);
          return of(null);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe();
  }

  refresh(): void {
    this.load(true);
  }

  exportCsv(): string | null {
    const rows = this.filteredTenants();
    if (rows.length === 0) return null;
    return tenantsToCsv(rows);
  }

  private applyPayload(payload: AdminTenantsPayload | undefined): void {
    if (!payload) return;
    this.tenants.set(payload.tenants ?? []);
    this.countsByStatus.set(payload.countsByStatus ?? {});
    this.totalTenants.set(payload.total);
    this.lastSyncedAt.set(new Date());
  }
}

export function tenantAgeInDays(tenant: PlatformTenant, now: Date = new Date()): number {
  const created = new Date(tenant.createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((now.getTime() - created) / 86_400_000));
}

function toMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { error?: { message?: string } } | null;
    if (body?.error?.message) return body.error.message;
    if (err.status === 0) return 'No hay conexión con la API de plataforma';
    if (err.status === 403) return 'Tu cuenta no tiene permisos de administrador de plataforma';
    return `Error ${err.status} al consultar la plataforma`;
  }
  return 'Error inesperado al consultar la plataforma';
}
