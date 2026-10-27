import { Injectable, signal } from '@angular/core'
import { Supplier, PurchaseOrder, CreatePurchaseOrder } from './purchasing.models'
import { PurchasingApi } from './purchasing.api'
import { TenantService } from '../../core/tenancy/tenant.service'

@Injectable({ providedIn: 'root' })
export class PurchasingStore {
  private _suppliers = signal<Supplier[]>([])
  private _orders = signal<PurchaseOrder[]>([])
  private _loading = signal(true)
  private _saving = signal(false)

  readonly loading = this._loading.asReadonly()
  readonly saving = this._saving.asReadonly()
  readonly suppliers = this._suppliers.asReadonly()
  readonly orders = this._orders.asReadonly()

  readonly tab = signal<'suppliers' | 'orders'>('suppliers')

  constructor(
    private api: PurchasingApi,
    private tenantService: TenantService
  ) {}

  load(): void {
    this._loading.set(true)
    this.api.getSuppliers().subscribe({
      next: (list) => {
        this._suppliers.set(list ?? [])
        this.loadOrders()
      },
      error: () => this._loading.set(false),
    })
  }

  private loadOrders(): void {
    this.api.getPurchaseOrders().subscribe({
      next: (list) => {
        this._orders.set(list ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  setTab(tab: 'suppliers' | 'orders'): void {
    this.tab.set(tab)
  }

  getBranchId(): string {
    return this.tenantService.getBranchId() ?? ''
  }

  createOrder(order: CreatePurchaseOrder): void {
    this._saving.set(true)
    this.api.createOrder(order).subscribe({
      next: (created) => {
        this._orders.update((list) => [created, ...list])
        this._saving.set(false)
      },
      error: () => this._saving.set(false),
    })
  }
}
