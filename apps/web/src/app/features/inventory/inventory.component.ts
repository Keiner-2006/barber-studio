import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Control operativo</p>
          <h1>Inventario<span class="accent">.</span></h1>
          <p class="subtitle">No dejes que un producto detenga tu operación.</p>
        </div>
        <button class="primary-button">+ Registrar producto</button>
      </div>
      <div class="stats-grid">
        @for (stat of stats; track stat.label) {
          <div class="stat-card">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
        }
      </div>
      <div class="placeholder">
        <p>Módulo de inventario en construcción</p>
        <p class="hint">Conectar con API de inventory</p>
      </div>
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
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; }
    .placeholder p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
    .hint { font-size: 13px; color: #6b7280; margin-top: 8px; font-family: 'Inter', sans-serif; }
  `]
})
export class InventoryComponent {
  stats = [
    { label: 'Valor en inventario', value: '$42,680' },
    { label: 'Productos activos', value: '128' },
    { label: 'Por reponer', value: '3' },
  ]
}
