import { Injectable, signal, computed } from '@angular/core'
import { BookingApi } from './booking.api'
import { StaffMember, AvailableSlot, BookingStep } from './booking.models'
import { Service, ServiceCategory } from '../catalog/catalog.models'
import { Branch } from '../../core/tenancy/tenant.models'

@Injectable({ providedIn: 'root' })
export class BookingStore {
  private _categories = signal<ServiceCategory[]>([])
  private _services = signal<Service[]>([])
  private _branches = signal<Branch[]>([])
  private _staff = signal<StaffMember[]>([])
  private _slots = signal<AvailableSlot[]>([])
  private _loading = signal(false)
  private _error = signal<string | null>(null)

  private _selectedCategory = signal<ServiceCategory | null>(null)
  private _selectedService = signal<Service | null>(null)
  private _selectedBranch = signal<Branch | null>(null)
  private _selectedStaff = signal<StaffMember | null>(null)
  private _selectedSlot = signal<AvailableSlot | null>(null)
  private _step = signal<BookingStep>('service')

  readonly categories = this._categories.asReadonly()
  readonly services = this._services.asReadonly()
  readonly branches = this._branches.asReadonly()
  readonly staff = this._staff.asReadonly()
  readonly slots = this._slots.asReadonly()
  readonly loading = this._loading.asReadonly()
  readonly error = this._error.asReadonly()

  readonly currentStep = this._step.asReadonly()
  readonly selectedService = this._selectedService.asReadonly()
  readonly selectedBranch = this._selectedBranch.asReadonly()
  readonly selectedStaff = this._selectedStaff.asReadonly()
  readonly selectedSlot = this._selectedSlot.asReadonly()

  readonly isComplete = computed(() => {
    return !!(
      this._selectedService() &&
      this._selectedBranch() &&
      this._selectedStaff() &&
      this._selectedSlot()
    )
  })

  constructor(private bookingApi: BookingApi) {}

  loadCategories(): void {
    this._loading.set(true)
    this.bookingApi.getCategories().subscribe({
      next: (list) => {
        this._categories.set(list ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  loadServices(categoryId?: string): void {
    this._loading.set(true)
    this.bookingApi.getServices(categoryId).subscribe({
      next: (list) => {
        this._services.set(list ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  loadBranches(): void {
    this._loading.set(true)
    this.bookingApi.getBranches().subscribe({
      next: (list) => {
        this._branches.set(list ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  loadStaff(branchId: string): void {
    this._loading.set(true)
    this.bookingApi.getStaff(branchId).subscribe({
      next: (list) => {
        this._staff.set(list ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  loadAvailability(branchId: string, serviceId: string, from: string, to: string, staffId?: string): void {
    this._loading.set(true)
    this.bookingApi
      .getAvailability({ branchId, serviceId, staffId, from, to })
      .subscribe({
        next: (list) => {
          this._slots.set(list ?? [])
          this._loading.set(false)
        },
        error: () => this._loading.set(false),
      })
  }

  selectCategory(category: ServiceCategory): void {
    this._selectedCategory.set(category)
    this._step.set('service')
  }

  selectService(service: Service): void {
    this._selectedService.set(service)
    this._step.set('branch')
  }

  selectBranch(branch: Branch): void {
    this._selectedBranch.set(branch)
    this._step.set('staff')
  }

  selectStaff(staff: StaffMember): void {
    this._selectedStaff.set(staff)
    this._step.set('time')
  }

  selectSlot(slot: AvailableSlot): void {
    this._selectedSlot.set(slot)
    this._step.set('confirm')
  }

  reset(): void {
    this._selectedCategory.set(null)
    this._selectedService.set(null)
    this._selectedBranch.set(null)
    this._selectedStaff.set(null)
    this._selectedSlot.set(null)
    this._step.set('service')
  }
}
