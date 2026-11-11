import { Injectable, signal, computed } from '@angular/core'
import { forkJoin } from 'rxjs'
import { TenantService } from '../../core/tenancy/tenant.service'
import type { BranchStock } from './inventory.models'
import { Product, CreateProduct } from './inventory.models'
import { InventoryApi } from './inventory.api'

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private _products = signal<Product[]>([])
  private _stock = signal<BranchStock[]>([])
  private _error = signal<string | null>(null)
  private _loading = signal(true)
  private _saving = signal(false)

  readonly error = this._error.asReadonly()
  readonly currency = computed(() => this.tenantService.tenant()?.currencyCode ?? 'COP')
  readonly loading = this._loading.asReadonly()
  readonly saving = this._saving.asReadonly()
  readonly products = this._products.asReadonly()

  readonly totalStockValue = computed(() => this._stock().reduce((sum, stock) => sum + Number(stock.quantity) * Number(stock.averageCost), 0))
  readonly activeProductCount = computed(() => this._products().filter(p => p.active).length)
  readonly lowStockCount = computed(() => this._products().filter(p => p.active && p.minQuantity > 0 && this.quantityForProduct(p.id) <= p.minQuantity).length)

  constructor(private api: InventoryApi, private tenantService: TenantService) {}

  quantityForProduct(id: string): number {
    return this._stock().filter(s => s.productId === id).reduce((sum, s) => sum + Number(s.quantity), 0)
  }

  load(search?: string): void {
    this._loading.set(true)
    this._error.set(null)
    forkJoin({ products: this.api.getProducts(search), stock: this.api.getStock() }).subscribe({
      next: (resp) => {
        this._products.set(resp.products.products ?? [])
        this._stock.set(resp.stock ?? [])
        this._loading.set(false)
      },
      error: () => {
        this._error.set('No se pudo cargar el inventario. Intenta nuevamente.')
        this._loading.set(false)
      },
    })
  }

  search(search: string): void {
    this.load(search)
  }

  create(data: CreateProduct): void {
    this._saving.set(true)
    this.api.createProduct(data).subscribe({
      next: (product) => {
        this._products.update((list) => [product, ...list])
        this._saving.set(false)
      },
      error: () => this._saving.set(false),
    })
  }

  formatMoney(amount: string, currency: string): string {
    const num = parseFloat(amount || '0')
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(num)
  }
}