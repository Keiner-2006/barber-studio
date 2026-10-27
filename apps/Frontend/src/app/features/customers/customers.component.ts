import { Component, signal, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CustomersStore } from './customers.store'
import { CreateCustomer } from './customers.models'

export interface CreateCustomerForm {
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  document: string
  notes: string
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Relación con clientes</p>
          <h1>Tus clientes<span class="accent">.</span></h1>
          <p class="subtitle">Conoce mejor a quienes vuelven a tu silla.</p>
        </div>
        <button class="primary-button" (click)="openCreateDialog()">+ Nuevo cliente</button>
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input placeholder="Buscar por nombre, teléfono o correo" [(ngModel)]="searchTerm" (input)="onSearch()" />
      </div>
      @if (store.loading()) {
        <div class="loading">Cargando clientes...</div>
      } @else if (store.customers().length === 0) {
        <div class="empty-state">
          <p>No hay clientes registrados</p>
          <p class="hint">Presiona "Nuevo cliente" para agregar uno.</p>
        </div>
      } @else {
        <table class="customers-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Visitas</th>
              <th>Total gastado</th>
              <th>Última visita</th>
            </tr>
          </thead>
          <tbody>
            @for (customer of store.customers(); track customer.id) {
              <tr>
                <td>
                  <div class="customer-name">{{ customer.firstName }} {{ customer.lastName }}</div>
                </td>
                <td class="contact-cell">
                  <div>{{ customer.email || customer.phone || '—' }}</div>
                </td>
                <td>{{ customer.totalVisits || 0 }}</td>
                <td>{{ store.formatMoney(customer.totalSpent, customer.currency) }}</td>
                <td>{{ customer.lastVisitAt ? store.formatDate(customer.lastVisitAt) : '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }

      @if (showCreateDialog) {
        <div class="dialog-backdrop" (click)="closeCreateDialog()">
          <div class="dialog" (click)="\$event.stopPropagation()">
            <h3>Nuevo cliente</h3>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="newCustomer.firstName" placeholder="Nombre" />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input [(ngModel)]="newCustomer.lastName" placeholder="Apellido" />
            </div>
            <div class="form-group">
              <label>Nombre completo</label>
              <input [(ngModel)]="newCustomer.fullName" placeholder="Nombre completo" />
            </div>
            <div class="form-group">
              <label>Correo</label>
              <input [(ngModel)]="newCustomer.email" type="email" placeholder="correo@ejemplo.com" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input [(ngModel)]="newCustomer.phone" placeholder="Teléfono" />
            </div>
            <div class="form-group">
              <label>Documento</label>
              <input [(ngModel)]="newCustomer.document" placeholder="Documento" />
            </div>
            <div class="form-group">
              <label>Notas</label>
              <textarea [(ngModel)]="newCustomer.notes" placeholder="Notas"></textarea>
            </div>
            <div class="dialog-actions">
              <button class="secondary-button" (click)="closeCreateDialog()">Cancelar</button>
              <button class="primary-button" (click)="createCustomer()" [disabled]="store.saving()">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
    .primary-button:hover { transform: translateY(-1px); }
    .primary-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .secondary-button { padding: 12px 20px; background: transparent; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .search-bar { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 20px; }
    .search-icon { font-size: 14px; }
    input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
    textarea { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; min-height: 60px; resize: vertical; font-family: inherit; }
    .loading { padding: 48px; text-align: center; color: #6b7280; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; }
    .empty-state p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
    .hint { font-size: 13px; color: #6b7280; margin-top: 8px; }
    .customers-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .customers-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .customers-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .customers-table tbody tr:last-child td { border-bottom: none; }
    .customer-name { font-weight: 500; color: #2d2d2d; }
    .contact-cell { color: #6b7280; }
    .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .dialog { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 420px; max-height: 90vh; overflow-y: auto; }
    .dialog h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; margin-top: 0; margin-bottom: 16px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
    .form-group input, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
    .form-group input:focus, .form-group textarea:focus { border-color: #b87333; outline: none; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
  `]
})
export class CustomersComponent implements OnInit {
  searchTerm = ''
  showCreateDialog = false
  newCustomer: CreateCustomerForm = { firstName: '', lastName: '', fullName: '', email: '', phone: '', document: '', notes: '' }

  constructor(readonly store: CustomersStore) {}

  ngOnInit(): void {
    this.store.search()
  }

  onSearch(): void {
    this.store.search(this.searchTerm || undefined)
  }

  openCreateDialog(): void {
    this.newCustomer = { firstName: '', lastName: '', fullName: '', email: '', phone: '', document: '', notes: '' }
    this.showCreateDialog = true
  }

  closeCreateDialog(): void {
    this.showCreateDialog = false
  }

  createCustomer(): void {
    if (!this.newCustomer.firstName || !this.newCustomer.lastName) return
    this.store.create({ ...this.newCustomer, fullName: this.newCustomer.fullName || `${this.newCustomer.firstName} ${this.newCustomer.lastName}`.trim() })
    this.closeCreateDialog()
  }
}
