import { Injectable, signal } from '@angular/core'
import { Observable, tap, map, catchError, throwError } from 'rxjs'
import { Role, ROLES } from '@navaja/shared'
import { ApiClient } from '../http/api-client'
import { Branch, TenantInfo, TenantMeResponse, BranchesResponse } from './tenant.models'

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private currentTenant = signal<TenantInfo | null>(null)
  private currentBranch = signal<Branch | null>(null)
  private availableBranches = signal<Branch[]>([])
  private currentRole = signal<Role | null>(null)
  private currentStaffId = signal<string | null>(null)
  private currentPermissions = signal<string[]>([])
  private selectedTenantId = signal<string | null>(null)

  readonly tenant = this.currentTenant.asReadonly()
  readonly branch = this.currentBranch.asReadonly()
  readonly branches = this.availableBranches.asReadonly()
  readonly role = this.currentRole.asReadonly()
  readonly staffId = this.currentStaffId.asReadonly()
  readonly permissions = this.currentPermissions.asReadonly()
  readonly tenantId = this.selectedTenantId.asReadonly()

  constructor(private api: ApiClient) {
    const savedTenantId = typeof localStorage !== 'undefined' ? localStorage.getItem('navaja_tenant_id') : null
    this.selectedTenantId.set(savedTenantId)
  }

  setTenantId(tenantId: string | null): void {
    const changed = this.selectedTenantId() !== tenantId
    this.selectedTenantId.set(tenantId)

    if (typeof localStorage !== 'undefined') {
      if (tenantId) localStorage.setItem('navaja_tenant_id', tenantId)
      else localStorage.removeItem('navaja_tenant_id')
    }

    if (changed) {
      this.currentRole.set(null)
      this.currentStaffId.set(null)
      this.currentPermissions.set([])
      this.currentTenant.set(null)
      this.currentBranch.set(null)
      this.availableBranches.set([])
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('navaja_branch_id')
      }
    }
  }

  load(): Observable<void> {
    return this.api
      .get<TenantMeResponse>('/tenants/me')
      .pipe(
        tap((resp) => {
          const role = Object.values(ROLES).find((candidate) => candidate === resp.data.role) ?? null
          this.currentRole.set(role)
          this.currentStaffId.set(resp.data.staffId ?? null)
          this.currentPermissions.set(resp.data.permissions ?? [])

          if (role === 'platform_admin' || role === 'platform_support' || !resp.data.tenant) {
            this.currentTenant.set(null)
            this.currentBranch.set(null)
            this.availableBranches.set([])
            this.selectedTenantId.set(null)
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem('navaja_tenant_id')
              localStorage.removeItem('navaja_branch_id')
            }
            return
          }

          this.currentTenant.set(resp.data.tenant)
          this.selectedTenantId.set(resp.data.tenant.id)
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('navaja_tenant_id', resp.data.tenant.id)
          }
          if (resp.data.branches) {
            this.availableBranches.set(resp.data.branches)
            const savedBranchId =
              typeof localStorage !== 'undefined'
                ? localStorage.getItem('navaja_branch_id')
                : null
            const saved = resp.data.branches.find((branch) => branch.id === savedBranchId)
            this.currentBranch.set(saved ?? resp.data.branches[0] ?? null)
          } else {
            this.currentBranch.set(null)
            this.availableBranches.set([])
          }
        }),
        map(() => undefined as void),
        catchError((err) => {
          if (err.status === 403 || err.status === 401) {
            this.currentTenant.set(null)
            this.currentBranch.set(null)
            this.availableBranches.set([])
            this.currentRole.set(null)
            this.currentStaffId.set(null)
            this.currentPermissions.set([])
          }
          return throwError(() => err)
        })
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
    this.currentStaffId.set(null)
    this.currentPermissions.set([])
    this.currentTenant.set(null)
    this.currentBranch.set(null)
    this.availableBranches.set([])
    this.currentRole.set(null)
    this.selectedTenantId.set(null)
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('navaja_tenant_id')
      localStorage.removeItem('navaja_branch_id')
    }
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