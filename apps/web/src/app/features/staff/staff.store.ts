import { Injectable, signal, computed } from '@angular/core'
import { StaffApi } from './staff.api'
import { StaffMember, CreateStaffInput, UpdateStaffInput } from './staff.models'

@Injectable({ providedIn: 'root' })
export class StaffStore {
  private _staff = signal<StaffMember[]>([])
  private _loading = signal(false)
  private _error = signal<string | null>(null)

  readonly staff = this._staff.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly error = this._error.asReadonly()

  readonly activeStaff = computed(() => this._staff().filter(s => s.status === 'active'))
  readonly bookableStaff = computed(() => this.activeStaff().filter(s => s.isBookable))

  constructor(private api: StaffApi) {}

  load(): void {
    this._loading.set(true)
    this._error.set(null)
    this.api.getStaff().subscribe({
      next: (staff) => {
        this._staff.set(staff)
        this._loading.set(false)
      },
      error: (err) => {
        this._error.set(err.message || 'Error al cargar personal')
        this._loading.set(false)
      },
    })
  }

  create(input: CreateStaffInput): void {
    this._loading.set(true)
    this.api.createStaff(input).subscribe({
      next: (staff) => {
        this._staff.update((s) => [...s, staff])
        this._loading.set(false)
      },
      error: (err) => {
        this._error.set(err.message || 'Error al crear personal')
        this._loading.set(false)
      },
    })
  }

  update(id: string, input: UpdateStaffInput): void {
    this._loading.set(true)
    this.api.updateStaff(id, input).subscribe({
      next: (staff) => {
        this._staff.update((s) => s.map((m) => (m.id === id ? staff : m)))
        this._loading.set(false)
      },
      error: (err) => {
        this._error.set(err.message || 'Error al actualizar personal')
        this._loading.set(false)
      },
    })
  }

  delete(id: string): void {
    this._loading.set(true)
    this.api.deleteStaff(id).subscribe({
      next: () => {
        this._staff.update((s) => s.filter((m) => m.id !== id))
        this._loading.set(false)
      },
      error: (err) => {
        this._error.set(err.message || 'Error al eliminar personal')
        this._loading.set(false)
      },
    })
  }
}