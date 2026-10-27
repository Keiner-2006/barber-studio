import { Injectable, signal } from '@angular/core'
import { Customer, CustomerSearch, CreateCustomer } from './customers.models'
import { CustomersApi, CustomerSearchResult } from './customers.api'

@Injectable({ providedIn: 'root' })
export class CustomersStore {
  private _customers = signal<Customer[]>([])
  private _loading = signal(false)
  private _saving = signal(false)

  readonly loading = this._loading.asReadonly()
  readonly saving = this._saving.asReadonly()
  readonly customers = this._customers.asReadonly()

  constructor(private api: CustomersApi) {}

  search(query?: string): void {
    this._loading.set(true)
    this.api.search({ query, limit: 100 }).subscribe({
      next: (resp) => {
        this._customers.set(resp.data ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  create(data: CreateCustomer): void {
    this._saving.set(true)
    this.api.createCustomer(data).subscribe({
      next: (customer) => {
        this._customers.update((list) => [customer, ...list])
        this._saving.set(false)
      },
      error: () => this._saving.set(false),
    })
  }

  formatMoney(amount: string, currency: string): string {
    const num = parseFloat(amount || '0')
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(num)
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }
}
