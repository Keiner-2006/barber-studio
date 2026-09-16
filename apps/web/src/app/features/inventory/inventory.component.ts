import { Component, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { InventoryStore } from './inventory.store'
import { CreateProduct } from './inventory.models'

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Control operativo</p>
          <h1>Inventario<span class="accent">.</span></h1>
          <p class="subtitle">No dejes que un producto detenga tu operación.</p>
        </div>
        <button class="primary-button" (click)="openCreateDialog()">+ Registrar producto</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <p class="stat-label">Valor en inventario</p>
          <p class="stat-value">{{ store.totalStockValue() | currency:'MXN':'symbol':'1.0-0':'es-MX' }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Productos activos</p>
          <p class="stat-value">{{ store.products().length }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">Por reponer</p>
          <p class="stat-value">{{ store.lowStockCount() }}</p>
        </div>
      </div>

      @if (store.loading()) {
        <div class="loading">Cargando inventario...</div>
      } @else if (store.products().length === 0) {
        <div class="empty-state">
          <p>No hay productos registrados</p>
          <p class="hint">Presiona "Registrar producto" para agregar uno.</p>
        </div>
      } @else {
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Costo</th>
              <th>Precio sugerido</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            @for (product of store.products(); track product.id) {
              <tr>
                <td>
                  <div class="product-name">{{ product.name }}</div>
                  @if (product.description) {
                    <div class="product-desc">{{ product.description }}</div>
                  }
                </td>
                <td class="mono">{{ product.sku }}</td>
                <td>{{ product.category || '—' }}</td>
                <td>{{ store.formatMoney(product.unitCost, 'MXN') }}</td>
                <td>{{ product.suggestedPrice ? store.formatMoney(product.suggestedPrice, 'MXN') : '—' }}</td>
                <td>
                  <span [class]="product.active ? 'badge-active' : 'badge-inactive'">
                    {{ product.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }

      @if (showCreateDialog()) {
        <div class="dialog-backdrop" (click)="closeCreateDialog()">
          <div class="dialog" (click)="\$event.stopPropagation()">
            <h3>Registrar producto</h3>
            <div class="form-group">
              <label>Nombre</label>
              <input [(ngModel)]="newProduct().name" (ngModelChange)="updateField('name', $event)" placeholder="Nombre del producto" />
            </div>
            <div class="form-group">
              <label>SKU</label>
              <input [(ngModel)]="newProduct().sku" (ngModelChange)="updateField('sku', $event)" placeholder="Código único" />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="newProduct().description" (ngModelChange)="updateField('description', $event)" placeholder="Descripción"></textarea>
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <input [(ngModel)]="newProduct().category" (ngModelChange)="updateField('category', $event)" placeholder="Ej. Styling, Barba..." />
            </div>
            <div class="form-group">
              <label>Unidad</label>
              <input [(ngModel)]="newProduct().unit" (ngModelChange)="updateField('unit', $event)" placeholder="pieza" />
            </div>
            <div class="form-group">
              <label>Costo unitario (MXN)</label>
              <input type="number" step="0.01" placeholder="0.00"
                [ngModel]="newProduct().unitCost"
                (ngModelChange)="updateField('unitCost', $event)" />
            </div>
            <div class="form-group">
              <label>Precio sugerido (MXN)</label>
              <input type="number" step="0.01" placeholder="0.00"
                [ngModel]="newProduct().suggestedPrice"
                (ngModelChange)="updateField('suggestedPrice', $event)" />
            </div>
            <div class="form-group">
              <label>Stock mínimo</label>
              <input type="number" placeholder="0"
                [ngModel]="newProduct().minQuantity"
                (ngModelChange)="updateField('minQuantity', $event)" />
            </div>
            <div class="dialog-actions">
              <button class="secondary-button" (click)="closeCreateDialog()">Cancelar</button>
              <button class="primary-button" (click)="createProduct()" [disabled]="store.saving()">Guardar</button>
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
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; }
    .stat-label { font-size: 13px; color: #6b7280; }
    .stat-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #2d2d2d; margin-top: 8px; }
    .loading { padding: 48px; text-align: center; color: #6b7280; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; }
    .empty-state p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
    .hint { font-size: 13px; color: #6b7280; margin-top: 8px; }
    .inventory-table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .inventory-table th { background: #f9fafb; padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
    .inventory-table td { padding: 12px 20px; border-bottom: 1px solid #f3f4f6; font-size: 13px; vertical-align: top; }
    .inventory-table tbody tr:last-child td { border-bottom: none; }
    .product-name { font-weight: 500; color: #2d2d2d; }
    .product-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .mono { font-family: monospace; font-size: 12px; color: #6b7280; }
    .badge-active { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; background: #dcfce7; color: #166534; }
    .badge-inactive { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; background: #fee2e2; color: #991b2b; }
    .primary-button:hover { transform: translateY(-1px); }
    .primary-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .secondary-button { padding: 12px 20px; background: transparent; color: #6b7280; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; }
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
export class InventoryComponent implements OnInit {
  showCreateDialog = signal(false)
  newProduct = signal<CreateProduct>({ name: '', sku: '', unitCost: '', minQuantity: 0 })

  constructor(public store: InventoryStore) {}

  ngOnInit(): void {
    this.store.load()
  }

  openCreateDialog(): void {
    this.newProduct.set({ name: '', sku: '', unitCost: '', minQuantity: 0 })
    this.showCreateDialog.set(true)
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false)
  }

  updateField(field: keyof CreateProduct, value: string | number): void {
    this.newProduct.update((p) => ({ ...p, [field]: value }))
  }

  createProduct(): void {
    const product = this.newProduct()
    if (!product.name || !product.sku || !product.unitCost) return
    this.store.create(product)
    this.closeCreateDialog()
  }
}
