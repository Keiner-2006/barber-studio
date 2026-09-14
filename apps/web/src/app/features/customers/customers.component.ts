import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Relación con clientes</p>
          <h1>Tus clientes<span class="accent">.</span></h1>
          <p class="subtitle">Conoce mejor a quienes vuelven a tu silla.</p>
        </div>
        <button class="primary-button">+ Nuevo cliente</button>
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input placeholder="Buscar por nombre, teléfono o correo" />
      </div>
      <div class="placeholder">
        <p>Módulo de clientes en construcción</p>
        <p class="hint">Conectar con API de customers</p>
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
    .search-bar { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 20px; }
    .search-icon { font-size: 14px; }
    input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; }
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; }
    .placeholder p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
    .hint { font-size: 13px; color: #6b7280; margin-top: 8px; font-family: 'Inter', sans-serif; }
  `]
})
export class CustomersComponent {}
