import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { PurchasingStore } from './purchasing.store'
import { OrderItemInput, CreatePurchaseOrder } from './purchasing.models'

@Component({
  selector: 'app-purchasing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Compras y proveedores</p>
          <h1>Compras<span class="accent">.</span></h1>
          <p class="subtitle">Gestiona órdenes de compra y recepción de productos.</p>
        </div>
        <button class="primary-button" (click)="showOrderDialog.set(true)">+ Nueva orden</button>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="store.tab() === 'suppliers'" (click)="store.setTab('suppliers')">Proveedores</button>
        <button class="tab" [class.active]="store.tab() === 'orders'" (click)="store.setTab('orders')">Órdenes</button>
      </div>

      @if (store.tab() === 'suppliers') {
        @if (store.loading()) {
          <div class="loading">Cargando...</div>
        } @else if (store.suppliers().length === 0) {
          <div class="empty-state"><p>No hay proveedores</p></div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              @for (s of store.suppliers(); track s.id) {
                <tr>
                  <td>{{ s.name }}</td>
                  <td>{{ s.contactName || '—' }}</td>
                  <td>{{ s.email || '—' }}</td>
                  <td>{{ s.phone || '—' }}</td>
                  <td><span class="badge" [class.active]="s.active"> {{ s.active ? 'Activo' : 'Inactivo' }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        }
      } @else {
        @if (store.loading()) {
          <div class="loading">Cargando...</div>
        } @else if (store.orders().length === 0) {
          <div class="empty-state"><p>No hay órdenes de compra</p></div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Sucursal</th>
                <th>Estado</th>
                <th>Fecha esperada</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              @for (o of store.orders(); track o.id) {
                <tr>
                  <td>{{ o.supplierName || '—' }}</td>
                  <td>{{ o.branchId.slice(0, 8) }}</td>
                  <td><span class="badge" [class.active]="o.status === 'ordered' || o.status === 'received'">{{ o.status }}</span></td>
                  <td>{{ o.expectedDate || '—' }}</td>
                  <td>{{ o.total || '0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      }

      @if (showOrderDialog()) {
        <div class="dialog-backdrop" (click)="closeOrderDialog()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <h3>Nueva orden de compra</h3>
            <div class="form-group">
              <label>Proveedor</label>
              <select [(ngModel)]="orderForm.supplierId">
                <option value="">Seleccionar</option>
                @for (s of store.suppliers(); track s.id) {
                  <option [value]="s.id">{{ s.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Observaciones</label>
              <input [(ngModel)]="orderForm.notes" placeholder="Notas de la orden" />
            </div>
            <div class="items-section">
              <label class="items-label">Productos</label>
              @for (item of orderForm.items; track $index) {
                <div class="item-row">
                  <input class="item-input" type="text" placeholder="Product ID" [(ngModel)]="item.productId" />
                  <input class="item-input small" type="number" placeholder="Cant." [(ngModel)]="item.quantityOrdered" min="1" />
                  <input class="item-input small" type="number" placeholder="Costo" step="0.01" [(ngModel)]="item.unitCost" />
                  <button class="remove-btn" (click)="removeItem($index)" [disabled]="orderForm.items.length <= 1">×</button>
                </div>
              }
              <button class="link-button" (click)="addItem()">+ Agregar producto</button>
            </div>
            <div class="dialog-actions">
              <button class="secondary-button" (click)="closeOrderDialog()">Cancelar</button>
              <button class="primary-button" (click)="createOrder()" [disabled]="store.saving() || !orderForm.supplierId || orderForm.items.length === 0">Crear orden</button>
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
    .primary-button:disabled { opacity: 0.5; cursor: not-allowed; }
    .secondary-button { padding: 12px 20px; background: transparent; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    .tab { padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 14px; color: #6b7280; }
    .tab.active { color: #b87333; border-bottom-color: #b87333; font-weight: 500; }
    .data-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .data-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .data-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; background: #f3f4f6; color: #6b7280; text-transform: capitalize; }
    .badge.active { background: #dcfce7; color: #166534; }
    .loading { padding: 48px; text-align: center; color: #6b7280; }
    .empty-state { display: flex; align-items: center; justify-content: center; min-height: 200px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; color: #6b7280; }
    .dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .dialog { background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 420px; }
    .dialog h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; margin-top: 0; margin-bottom: 16px; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
    .form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
    .form-group input:focus, .form-group select:focus { border-color: #b87333; outline: none; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .items-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
    .items-label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
    .item-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .item-input { flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; }
    .item-input.small { max-width: 100px; }
    .remove-btn { width: 24px; height: 24px; background: #fee2e2; color: #991b2b; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .link-button { background: none; border: none; color: #b87333; font-size: 12px; font-weight: 500; cursor: pointer; }
  `]
})
export class PurchasingComponent implements OnInit {
  showOrderDialog = signal(false)
  orderForm: { supplierId: string; notes: string; items: OrderItemInput[] } = {
    supplierId: '',
    notes: '',
    items: [{ productId: '', quantityOrdered: 1, unitCost: '' }],
  }

  constructor(public store: PurchasingStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  closeOrderDialog(): void {
    this.showOrderDialog.set(false)
  }

  addItem(): void {
    this.orderForm.items = [...this.orderForm.items, { productId: '', quantityOrdered: 1, unitCost: '' }]
  }

  removeItem(index: number): void {
    this.orderForm.items = this.orderForm.items.filter((_, i) => i !== index)
  }

  createOrder(): void {
    if (!this.orderForm.supplierId || this.orderForm.items.length === 0) return
    const order: CreatePurchaseOrder = {
      supplierId: this.orderForm.supplierId,
      branchId: this.store.getBranchId(),
      notes: this.orderForm.notes,
      items: this.orderForm.items,
    }
    this.store.createOrder(order)
    this.showOrderDialog.set(false)
  }
}
