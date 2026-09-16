import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BookingStore } from './booking.store'

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="booking-page">
      <div class="booking-header">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#b87333"/>
            <path d="M12 28L20 12L28 28" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1>Navaja Studio</h1>
        <p>Reserva tu cita en línea</p>
      </div>
      <div class="placeholder">
        <p>Flujo de reserva pública</p>
        <p class="hint">Seleccionar servicio → sucursal → barbero → horario → confirmar</p>
      </div>
    </div>
  `,
  styles: [`
    .booking-page { min-height: 100vh; background: linear-gradient(135deg, #fafaf8 0%, #f0ece4 100%); padding: 40px 20px; }
    .booking-header { text-align: center; margin-bottom: 40px; }
    .logo { margin-bottom: 16px; }
    .logo svg { margin: 0 auto; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 32px; color: #2d2d2d; }
    .booking-header p { color: #6b7280; font-size: 14px; margin-top: 8px; }
    .placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; background: white; border: 2px dashed #e5e7eb; border-radius: 12px; max-width: 600px; margin: 0 auto; }
    .placeholder p { font-family: 'DM Serif Display', serif; font-size: 20px; color: #2d2d2d; }
    .hint { font-size: 13px; color: #6b7280; margin-top: 8px; font-family: 'Inter', sans-serif; }
  `]
})
export class BookingComponent implements OnInit {
  constructor(public store: BookingStore) {}

  ngOnInit(): void {
    this.store.loadCategories()
    this.store.loadBranches()
  }
}
