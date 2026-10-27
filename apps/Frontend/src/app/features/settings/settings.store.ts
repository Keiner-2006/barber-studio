import { Injectable, signal } from '@angular/core'
import { FullBranch, StaffMember, CreateBranch, SettingsTenantView } from './settings.models'
import { SettingsApi } from './settings.api'

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private tenantSignal = signal<SettingsTenantView | null>(null)
  private branchesSignal = signal<FullBranch[]>([])
  private staffSignal = signal<StaffMember[]>([])
  private _loading = signal(false)
  private _saving = signal(false)

  readonly tenant = this.tenantSignal.asReadonly()
  readonly branches = this.branchesSignal.asReadonly()
  readonly staff = this.staffSignal.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly saving = this._saving.asReadonly()

  constructor(private api: SettingsApi) {}

  load(): void {
    this._loading.set(true)
    this.api.getTenant().subscribe({
      next: (t) => {
        this.tenantSignal.set({
          name: t.name,
          slug: t.slug,
          currencyCode: t.currencyCode,
          countryCode: t.countryCode,
          timezone: t.timezone,
        })
      },
      error: () => this.tenantSignal.set(null),
      complete: () => this._loading.set(false),
    })

    this.api.getBranches().subscribe({
      next: (branches) => {
        this.branchesSignal.set(branches)
        this._loading.set(false)
      },
      error: () => {
        this.branchesSignal.set([])
        this._loading.set(false)
      },
    })

    this.api.getStaff().subscribe({
      next: (staff) => this.staffSignal.set(staff ?? []),
      error: () => this.staffSignal.set([]),
    })
  }

  createBranch(data: CreateBranch): void {
    this._saving.set(true)
    this.api.createBranch(data).subscribe({
      next: (branch) => {
        this.branchesSignal.update((list) => [branch, ...list])
        this._saving.set(false)
      },
      error: () => this._saving.set(false),
    })
  }

  createStaff(data: { displayName: string; bio?: string; commissionRate?: string; email: string }): void {
    this._saving.set(true)
    this.api.createStaff(data).subscribe({
      next: (staff) => {
        this.staffSignal.update((list) => [...list, staff])
        this._saving.set(false)
      },
      error: () => this._saving.set(false),
    })
  }

  updateStaff(id: string, data: Partial<StaffMember>): void {
    this._saving.set(true)
    this.api.updateStaff(id, data).subscribe({
      next: (staff) => {
        this.staffSignal.update((list) => list.map((s) => (s.id === id ? staff : s)))
        this._saving.set(false)
      },
      error: () => this._saving.set(false),
    })
  }

  deleteStaff(id: string): void {
    this._saving.set(true)
    this.api.deleteStaff(id).subscribe({
      next: () => {
        this.staffSignal.update((list) => list.filter((s) => s.id !== id))
        this._saving.set(false)
      },
      error: () => this._saving.set(false),
    })
  }
}
