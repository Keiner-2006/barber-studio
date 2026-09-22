import { Injectable, signal, computed } from '@angular/core'
import { Observable, tap, map } from 'rxjs'
import { ApiClient } from '../http/api-client'
import { Branch, TenantInfo, TenantMeResponse, BranchesResponse } from './tenant.models'

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private currentTenant = signal<TenantInfo | null>(null)
  private currentBranch = signal<Branch | null>(null)
  private availableBranches = signal<Branch[]>([])

  readonly tenant = this.currentTenant.asReadonly()
  readonly branch = this.currentBranch.asReadonly()
  readonly branches = this.availableBranches.asReadonly()
  readonly tenantId = computed(() => this.currentTenant()?.id ?? null)

  constructor(private api: ApiClient) {
    const savedTenantId = typeof localStorage !== 'undefined' ? localStorage.getItem('navaja_tenant_id') : null
    if (savedTenantId) {
      this.currentTenant.set({ id: savedTenantId } as TenantInfo)
    }
  }

  load(): Observable<void> {
    return this.api
      .get<TenantMeResponse>('/tenants/me')
      .pipe(
      tap((resp) => {
          this.currentTenant.set(resp.data.tenant)
          this.availableBranches.set(resp.data.branches)
          const savedBranchId =
              typeof localStorage !== 'undefined'
                  ? localStorage.getItem('navaja_branch_id')
                  : null
          const saved = resp.data.branches.find((b) => b.id === savedBranchId)
          this.currentBranch.set(saved ?? resp.data.branches[0] ?? null)
      }),
        map(() => undefined as void)
      )
  }

  selectBranch(branchId: string): void {
    const branch = this.availableBranches().find((b) => b.id === branchId)
    if (branch) {
      this.currentBranch.set(branch)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('navaja_branch_id', branchId)
      }
    }
  }

  getBranchId(): string | null {
    return this.currentBranch()?.id ?? null
  }

  clear(): void {
    this.currentTenant.set(null)
    this.currentBranch.set(null)
    this.availableBranches.set([])
  }

  refreshBranches(): Observable<Branch[]> {
    return this.api
      .get<BranchesResponse>('/branches')
      .pipe(
        tap((resp) => {
          const filtered = (resp.data ?? []).filter((b) => b.status === 'active')
          this.availableBranches.set(filtered)
          const currentId = this.currentBranch()?.id
          if (!filtered.find((b) => b.id === currentId) && filtered.length > 0) {
            this.currentBranch.set(filtered[0])
          }
        }),
        map((resp) => resp.data ?? [])
      )
  }
}