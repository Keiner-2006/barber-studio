import { Injectable, signal, computed } from '@angular/core'
import { Service, ServiceCategory, CreateService, CreateServiceCategory } from './catalog.models'
import { CatalogApi } from './catalog.api'

interface ServiceGroup {
  categoryId: string
  categoryName: string
  services: Service[]
}

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private _services = signal<Service[]>([])
  private _categories = signal<ServiceCategory[]>([])
  private _loading = signal(false)

  readonly services = this._services.asReadonly()
  readonly categories = this._categories.asReadonly()
  readonly loading = this._loading.asReadonly()

  readonly groupedServices = computed((): ServiceGroup[] => {
    const svcs = this._services()
    const cats = this._categories()
    const noCategory = svcs.filter((s) => !s.categoryId || !cats.find((c) => c.id === s.categoryId))

    const groups: ServiceGroup[] = []

    cats.forEach((c) => {
      const groupServices = svcs.filter((s) => s.categoryId === c.id)
      if (groupServices.length > 0) {
        groups.push({ categoryId: c.id, categoryName: c.name, services: groupServices })
      }
    })

    if (noCategory.length > 0) {
      groups.push({ categoryId: 'no-category', categoryName: 'Sin categoría', services: noCategory })
    }

    return groups
  })

  constructor(private api: CatalogApi) {}

  load(): void {
    this._loading.set(true)
    this.api.getCategories().subscribe({
      next: (cats) => {
        this._categories.set(cats ?? [])
        this.loadServices()
      },
      error: () => {
        this._categories.set([])
        this.loadServices()
      },
    })
  }

  private loadServices(): void {
    this.api.getServices().subscribe({
      next: (services) => {
        this._services.set(services ?? [])
        this._loading.set(false)
      },
      error: () => this._loading.set(false),
    })
  }

  formatMoney(amount: string, currency: string): string {
    const num = parseFloat(amount || '0')
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(num)
  }
}