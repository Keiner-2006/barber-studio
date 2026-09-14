import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Análisis y métricas</p>
          <h1>Reportes<span class="accent">.</span></h1>
          <p class="subtitle">Visualiza el rendimiento de tu barbería.</p>
        </div>
      </div>
      <div class="placeholder">
        <p>Módulo de reportes en construcción</p>
        <p class="hint">Conectar con API de reports</p>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #2d2d2d; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; }
    .placeholder p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
    .hint { font-size: 13px; color: #6b7280; margin-top: 8px; font-family: 'Inter', sans-serif; }
  `]
})
export class ReportsComponent {}
