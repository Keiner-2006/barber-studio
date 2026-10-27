import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CatalogStore } from './catalog.store'

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Gestión de servicios</p>
          <h1>Catálogo<span class="accent">.</span></h1>
          <p class="subtitle">Configura los servicios que ofrece tu barbería.</p>
        </div>
        <button class="primary-button">+ Nuevo servicio</button>
      </div>

      <div class="search-bar">
        <input type="text" placeholder="Buscar servicio por nombre..." [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" />
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Servicios activos</p>
          <p class="stat-value">{{ store.services().length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Categorías</p>
          <p class="stat-value">{{ store.groupedServices().length }}</p>
        </div>
      </div>

      @if (store.loading()) {
        <div class="loading">Cargando catálogo...</div>
      } @else if (store.services().length === 0) {
        <div class="empty-state">
          <p>No hay servicios en el catálogo</p>
          <p class="hint">Presiona "Nuevo servicio" para agregar uno.</p>
        </div>
      } @else {
        <div class="services-list">
          @for (category of store.groupedServices(); track category.categoryId) {
            <div class="category-section">
              <h3 class="category-name">{{ category.categoryName }}</h3>
              <table class="services-table">
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Duración</th>
                    <th>Precio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  @for (service of category.services; track service.id) {
                    <tr>
                      <td>
                        <div class="service-name">{{ service.name }}</div>
                        @if (service.description) {
                          <div class="service-desc">{{ service.description }}</div>
                        }
                      </td>
                      <td>{{ service.durationMinutes }} min</td>
                      <td>{{ store.formatMoney(service.priceBase, service.currency) }}</td>
                      <td>
                        <span [class]="service.active ? 'badge-active' : 'badge-inactive'">
                          {{ service.active ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .search-bar {
        margin-bottom: 20px;
      }
      .search-bar input {
        width: 100%;
        max-width: 480px;
        padding: 10px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        background: white;
      }
      .search-bar input:focus {
        border-color: #b87333;
        outline: none;
      }
      .page { padding: 32px; max-width: 1400px; margin: 0 auto; }
      .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
      .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
      h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; }
      .accent { color: #b87333; }
      .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
      .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
      .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
      .stat-label { font-size: 13px; color: #6b7280; }
      .stat-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #2d2d2d; margin-top: 8px; }
      .loading { padding: 48px; text-align: center; color: #6b7280; }
      .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; }
      .empty-state p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
      .hint { font-size: 13px; color: #6b7280; margin-top: 8px; }
      .services-list { display: flex; flex-direction: column; gap: 24px; }
      .category-section { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
      .category-name { font-family: 'DM Serif Display', serif; font-size: 16px; color: #2d2d2d; margin: 0; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; }
      .services-table { width: 100%; border-collapse: collapse; }
      .services-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
      .services-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; vertical-align: top; }
      .services-table tbody tr:last-child td { border-bottom: none; }
      .service-name { font-weight: 500; color: #2d2d2d; }
      .service-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
      .badge-active { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; background: #dcfce7; color: #166534; }
      .badge-inactive { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; background: #fee2e2; color: #991b2b; }
    `]
})
export class CatalogComponent implements OnInit {
  searchQuery = signal('')

  constructor(readonly store: CatalogStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  onSearch(): void {
    this.store.search(this.searchQuery())
  }
}
