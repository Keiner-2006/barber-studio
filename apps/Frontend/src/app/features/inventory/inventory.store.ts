import { Injectable, signal, computed } from '@angular/core'
import { Product, CreateProduct } from './inventory.models'
import { InventoryApi } from './inventory.api'

@Injectable({ providedIn: 'root' })
export class InventoryStore {
  private _products = signal<Product[]>([])
  private _loading = signal(true)
  private _saving = signal(false)

  readonly loading = this._loading.asReadonly()
  readonly saving = this._saving.asReadonly()
  readonly products = this._products.asReadonly()

  readonly totalStockValue = computed(() => this._products().reduce((sum, p) => sum + (parseFloat(p.unitCost || '0') || 0), 0))
  readonly lowStockCount = computed(() => this._products().filter((p) => p.minQuantity > 0).length)

  constructor(private api: InventoryApi) {}

  load(search?: string): void {
    this._loading.set(true)
    this.api.getProducts(search).subscribe({
      next: (resp) => {
        this._products.set(resp.products ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
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
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(num)
  }
}