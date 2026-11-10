import { Injectable, signal, computed, inject } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { PlatformAdminApi, tenantsToCsv } from './platform-admin.api';
import { apiErrorMessage } from './platform-admin.view-helpers';
import {
  AdminTenantsPayload,
  DEFAULT_TENANT_FILTERS,
  Pagination,
  PlatformTenant,
  TenantFilters,
  TenantStatus,
  TenantViewMode,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_ORDER,
} from './platform-admin.models';

export interface StatusSlice {
  status: TenantStatus;
  label: string;
  count: number;
  ratio: number;
}

export interface CountrySlice {
  code: string;
  count: number;
  ratio: number;
}

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

  readonly filteredTenants = computed(() => {
    const { search, status, country } = this.filters();
    const term = search.trim().toLowerCase();
    return this.tenants().filter((t) => {
      if (status && t.status !== status) return false;
      if (country && t.countryCode?.toUpperCase() !== country) return false;
      if (!term) return true;
      return [t.tradeName, t.legalName, t.slug, t.city ?? '', t.phone ?? '', t.whatsapp ?? '', t.owner?.name ?? '', t.owner?.email ?? '']
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
    return { page, pageSize, total, totalPages, from, to: Math.min(from + pageSize - 1, total) };
  });

  readonly pagedTenants = computed(() => {
    const { page, pageSize } = this.pagination();
    return this.filteredTenants().slice((page - 1) * pageSize, page * pageSize);
  });

  readonly statusDistribution = computed<StatusSlice[]>(() => {
    const counts = this.countsByStatus();
    const total = this.totalTenants() ?? 0;
    return TENANT_STATUS_ORDER.map((status) => ({
      status,
      label: TENANT_STATUS_LABELS[status],
      count: counts[status] ?? 0,
      ratio: total > 0 ? (counts[status] ?? 0) / total : 0,
    }));
  });

  readonly recentTenants = computed(() => [...this.tenants()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6));

  readonly suspendedTenants = computed(() => this.tenants().filter((t) => t.status === 'suspended'));

  /** Tenants created in the last 30 days, from the loaded window. */
  readonly newLast30d = computed(() => {
    const since = Date.now() - 30 * 86_400_000;
    return this.tenants().filter((t) => new Date(t.createdAt).getTime() >= since).length;
  });

  readonly countryDistribution = computed<CountrySlice[]>(() => {
    const list = this.tenants();
    if (!list.length) return [];
    const counter = new Map<string, number>();
    for (const t of list) {
      const code = (t.countryCode || '—').toUpperCase();
      counter.set(code, (counter.get(code) ?? 0) + 1);
    }
    return [...counter.entries()]
      .map(([code, count]) => ({ code, count, ratio: count / list.length }))
      .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
  });

  readonly countryOptions = computed(() => this.countryDistribution().map((s) => s.code));

  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!f.search.trim() || !!f.status || !!f.country;
  });

  setSearch(search: string): void {
    this.filters.update((f) => ({ ...f, search }));
    this.page.set(1);
  }

  setStatusFilter(status: TenantStatus | null): void {
    this.filters.update((f) => ({ ...f, status }));
    this.page.set(1);
  }

  setCountryFilter(country: string | null): void {
    this.filters.update((f) => ({ ...f, country }));
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.pagination().totalPages));
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

  /** Keeps the list in sync after a status change made from the detail page. */
  patchTenant(id: string, patch: Partial<PlatformTenant>): void {
    const before = this.tenants().find((t) => t.id === id);
    this.tenants.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (before && patch.status && patch.status !== before.status) {
      this.countsByStatus.update((c) => ({
        ...c,
        [before.status]: Math.max(0, (c[before.status] ?? 1) - 1),
        [patch.status!]: (c[patch.status!] ?? 0) + 1,
      }));
    }
  }

  /**
   * Loads the tenant catalogue (up to `limit` rows). Status/country/search are applied client-side
   * over that window; `countsByStatus` always reflects the whole platform.
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
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.api
      .getTenants(this.filters().limit)
      .pipe(
        tap((response) => {
          this.applyPayload(response.data);
          this.offline.set(false);
          this.loaded = true;
        }),
        catchError((err: unknown) => {
          this.offline.set(true);
          this.loaded = true;
          this.error.set(apiErrorMessage(err, 'No se pudo consultar la plataforma'));
          this.tenants.set([]);
          this.countsByStatus.set({});
          this.totalTenants.set(null);
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  refresh(): void {
    this.load(true);
  }

  exportCsv(): string | null {
    const rows = this.filteredTenants();
    return rows.length ? tenantsToCsv(rows) : null;
  }

  private applyPayload(payload: AdminTenantsPayload | undefined): void {
    if (!payload) return;
    this.tenants.set(payload.tenants ?? []);
    this.countsByStatus.set(payload.countsByStatus ?? {});
    this.totalTenants.set(payload.total);
    this.lastSyncedAt.set(new Date());
  }
}
