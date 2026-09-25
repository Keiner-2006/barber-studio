import { Injectable, signal, computed } from '@angular/core'
import { AdminApi } from './admin.api'
import { AdminTenantSummary, AdminTenantsResponse } from './admin.models'

@Injectable({ providedIn: 'root' })
export class AdminStore {
  private _tenants = signal<AdminTenantSummary[]>([])
  private _total = signal(0)
  private _countsByStatus = signal<Record<string, number>>({})
  private _loading = signal(false)
  private _selectedTenant = signal<AdminTenantSummary | null>(null)

  readonly tenants = this._tenants.asReadonly()
  readonly total = this._total.asReadonly()
  readonly countsByStatus = this._countsByStatus.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly selectedTenant = this._selectedTenant.asReadonly()

  readonly activeCount = computed(() => this._countsByStatus()['active'] ?? 0)
  readonly provisioningCount = computed(() => this._countsByStatus()['provisioning'] ?? 0)
  readonly suspendedCount = computed(() => this._countsByStatus()['suspended'] ?? 0)
  readonly deletedCount = computed(() => this._countsByStatus()['deleted'] ?? 0)

  constructor(private api: AdminApi) {}

  load(params?: { status?: string; list?: boolean; limit?: number }): void {
    this._loading.set(true)
    this.api.getTenants(params).subscribe({
      next: (resp) => {
        this._total.set(resp.total)
        this._countsByStatus.set(resp.countsByStatus)
        this._tenants.set(resp.tenants ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  selectTenant(tenant: AdminTenantSummary | null): void {
    this._selectedTenant.set(tenant)
  }

  refresh(): void {
    this.load({ list: true })
  }
}