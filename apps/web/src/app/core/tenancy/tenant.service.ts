import { Injectable, signal } from '@angular/core'

export type Branch = {
  id: string
  name: string
  status: 'active' | 'inactive'
}

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private currentBranch = signal<Branch | null>(null)
  private availableBranches = signal<Branch[]>([])

  readonly branch = this.currentBranch.asReadonly()
  readonly branches = this.availableBranches.asReadonly()

  setBranches(branches: Branch[]): void {
    this.availableBranches.set(branches)
    if (branches.length > 0 && !this.currentBranch()) {
      const savedBranchId = this.getSavedBranchId()
      const savedBranch = branches.find((b) => b.id === savedBranchId)
      this.currentBranch.set(savedBranch ?? branches[0])
    }
  }

  selectBranch(branchId: string): void {
    const branch = this.availableBranches().find((b) => b.id === branchId)
    if (branch) {
      this.currentBranch.set(branch)
      this.saveBranchId(branchId)
    }
  }

  getBranchId(): string | null {
    return this.currentBranch()?.id ?? null
  }

  private getSavedBranchId(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('navaja_branch_id')
    }
    return null
  }

  private saveBranchId(branchId: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('navaja_branch_id', branchId)
    }
  }
}
