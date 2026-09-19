import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { BookingStore } from './booking.store'
import { AuthService } from '../../core/auth/auth.service'
import { RouterLink } from '@angular/router'
import { ROLE_LABELS } from '@navaja/shared'

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

      @if (store.booked()) {
        <div class="success-box">
          <h2>¡Reserva confirmada!</h2>
          <p>Tu turno ha sido agendado exitosamente.</p>
          <a routerLink="/login" class="button button-dark">Volver al login</a>
        </div>
      } @else {
        <div class="booking-flow">
          @if (isAuthenticated()) {
            <div class="steps">
              @for (step of steps; track step) {
                <div class="step" [class.active]="isStepActive(step)" [class.done]="isStepDone(step)">
                  <span class="step-number">{{ stepNumber(step) }}</span>
                  <span class="step-label">{{ stepLabel(step) }}</span>
                </div>
              }
            </div>
          }

          @if (!isAuthenticated() && showRegister) {
            <div class="step-content">
              <h2>Crea tu cuenta</h2>
              <p class="subtitle">Regístrate para agendar tu cita</p>
              <div class="register-form">
                <div class="form-group">
                  <label>Nombre completo</label>
                  <input type="text" [(ngModel)]="regName" placeholder="Tu nombre" />
                  @if (regNameError) { <span class="field-error">{{ regNameError }}</span> }
                </div>
                <div class="form-group">
                  <label>Correo electrónico</label>
                  <input type="email" [(ngModel)]="regEmail" placeholder="tu@email.com" />
                  @if (regEmailError) { <span class="field-error">{{ regEmailError }}</span> }
                </div>
                <div class="form-group">
                  <label>Contraseña</label>
                  <input [type]="showRegPassword ? 'text' : 'password'" [(ngModel)]="regPassword" placeholder="Mínimo 6 caracteres" />
                  @if (regPasswordError) { <span class="field-error">{{ regPasswordError }}</span> }
                </div>
                @if (regError) { <div class="error-message">{{ regError }}</div> }
                <button class="primary-button" (click)="register()" [disabled]="regLoading">
                  {{ regLoading ? 'Creando cuenta...' : 'Registrarse y Continuar' }}
                </button>
                <p class="login-link">¿Ya tienes cuenta? <a routerLink="/login" class="link">Inicia sesión</a></p>
              </div>
            </div>
          } @else {
            <div class="steps">
              @for (step of steps; track step) {
                <div class="step" [class.active]="isStepActive(step)" [class.done]="isStepDone(step)">
                  <span class="step-number">{{ stepNumber(step) }}</span>
                  <span class="step-label">{{ stepLabel(step) }}</span>
                </div>
              }
            </div>

            @if (store.currentStep() === 'service') {
              <div class="step-content">
                <h2>Selecciona un servicio</h2>
                @if (store.loading()) {
                  <div class="loading">Cargando servicios...</div>
                } @else {
                  <div class="grid">
                    @for (cat of store.categories(); track cat.id) {
                      <div class="category-card" (click)="store.selectCategory(cat)">
                        <h3>{{ cat.name }}</h3>
                      </div>
                    }
                  </div>
                  @if (store.selectedService()) {
                    <div class="selected-item">
                      <p>Servicio: <b>{{ store.selectedService()?.name }}</b></p>
                      <button class="secondary-button" (click)="store.selectService(null)">Cambiar</button>
                    </div>
                  }
                }
              </div>
            }

            @if (store.currentStep() === 'branch') {
              <div class="step-content">
                <h2>Selecciona una sucursal</h2>
                <div class="grid">
                  @for (branch of store.branches(); track branch.id) {
                    <div class="branch-card" (click)="store.selectBranch(branch)">
                      <h3>{{ branch.name }}</h3>
                      <p>{{ branch.city }}</p>
                    </div>
                  }
                </div>
              </div>
            }

            @if (store.currentStep() === 'staff') {
              <div class="step-content">
                <h2>Selecciona tu barbero</h2>
                @if (store.loading()) {
                  <div class="loading">Cargando barberos...</div>
                } @else {
                  <div class="grid">
                    @for (staff of store.staff(); track staff.id) {
                      <div class="staff-card" [class.selected]="store.selectedStaff()?.id === staff.id" (click)="store.selectStaff(staff)">
                        <div class="staff-avatar">{{ staff.name?.charAt(0) }}</div>
                        <p>{{ staff.name }}</p>
                        @if (staff.role) <p class="specialty">{{ ROLE_LABELS[staff.role as keyof typeof ROLE_LABELS] || staff.role }}</p>
                        @if (staff.specialty) <p class="specialty">{{ staff.specialty }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (store.currentStep() === 'time') {
              <div class="step-content">
                <h2>Elige tu hora</h2>
                @if (store.loading()) {
                  <div class="loading">Cargando disponibilidad...</div>
                } @else {
                  <div class="time-grid">
                    @for (slot of store.slots(); track slot.startsAt) {
                      <button class="time-slot" (click)="store.selectSlot(slot)">
                        {{ formatTime(slot.startsAt) }}
                      </button>
                    }
                  </div>
                  @if (store.slots().length === 0) {
                    <p class="no-slots">No hay horarios disponibles</p>
                  }
                }
              </div>
            }

            @if (store.currentStep() === 'confirm') {
              <div class="step-content">
                <h2>Confirma tu reserva</h2>
                <div class="confirm-card">
                  <div class="confirm-row">
                    <span class="label">Servicio:</span>
                    <span>{{ store.selectedService()?.name }}</span>
                  </div>
                  <div class="confirm-row">
                    <span class="label">Duración:</span>
                    <span>{{ store.selectedService()?.durationMinutes }} min</span>
                  </div>
                  <div class="confirm-row">
                    <span class="label">Sucursal:</span>
                    <span>{{ store.selectedBranch()?.name }}</span>
                  </div>
                  <div class="confirm-row">
                    <span class="label">Barbero:</span>
                    <span>{{ store.selectedStaff()?.name }}</span>
                  </div>
                  <div class="confirm-row">
                    <span class="label">Hora:</span>
                    <span>{{ formatTime(store.selectedSlot()?.startsAt || '') }}</span>
                  </div>
                  <div class="confirm-row">
                    <span class="label">Precio:</span>
                    <span>{{ store.selectedService()?.priceBase }}</span>
                  </div>
                  <div class="form-group">
                    <label>Tu nombre</label>
                    <input type="text" [(ngModel)]="tempName" placeholder="Tu nombre completo" />
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="tempEmail" placeholder="tu@email.com" />
                  </div>
                  <div class="form-group">
                    <label>Notas (opcional)</label>
                    <textarea [ngModel]="tempNotes" (ngModelChange)="tempNotes=$event; store.setNotes($event)" placeholder="Preferencias especiales..."></textarea>
                  </div>
                  @if (store.error()) { <div class="error-message">{{ store.error() }}</div> }
                  <button class="primary-button" (click)="book()" [disabled]="store.saving()">
                    {{ store.saving() ? 'Reservando...' : 'Confirmar Reserva' }}
                  </button>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .booking-page { min-height: 100vh; background: linear-gradient(135deg, #fafaf8 0%, #f0ece4 100%); padding: 40px 20px; }
      .booking-header { text-align: center; margin-bottom: 40px; }
      .booking-header h1 { font-family: 'DM Serif Display', serif; font-size: 32px; color: #2d2d2d; }
      .booking-header p { color: #6b7280; font-size: 14px; margin-top: 8px; }
      .success-box { max-width: 500px; margin: 80px auto; text-align: center; background: white; border-radius: 12px; padding: 40px; }
      .success-box h2 { color: #166534; font-family: 'DM Serif Display', serif; }
      .booking-flow { max-width: 800px; margin: 0 auto; }
      .steps { display: flex; justify-content: center; gap: 8px; margin-bottom: 32px; }
      .step { display: flex; align-items: center; gap: 6px; opacity: 0.4; }
      .step.active { opacity: 1; }
      .step.done { opacity: 0.7; }
      .step-number { width: 28px; height: 28px; border-radius: 50%; background: #b87333; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }
      .step-label { font-size: 12px; color: #6b7280; }
      .step-content { background: white; border-radius: 12px; padding: 24px; }
      .step-content h2 { font-family: 'DM Serif Display', serif; font-size: 24px; margin-bottom: 16px; }
      .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
      .category-card, .branch-card, .staff-card { border: 2px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer; transition: border-color 0.2s; }
      .category-card:hover, .branch-card:hover, .staff-card:hover { border-color: #b87333; }
      .staff-card.selected { border-color: #b87333; background: #fef8f0; }
      .staff-avatar { width: 40px; height: 40px; border-radius: 50%; background: #b87333; color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; margin-bottom: 8px; }
      .time-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .time-slot { padding: 8px 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s; }
      .time-slot:hover { border-color: #b87333; }
      .no-slots { color: #6b7280; text-align: center; padding: 24px; }
      .confirm-card { background: #f9fafb; border-radius: 8px; padding: 20px; }
      .confirm-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
      .confirm-row .label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
      .form-group { margin-bottom: 12px; }
      .form-group label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
      .form-group input, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
      .form-group input:focus, .form-group textarea:focus { border-color: #b87333; outline: none; }
      textarea { resize: vertical; min-height: 60px; }
      .primary-button { padding: 12px 20px; background: #b87333; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; width: 100%; }
      .primary-button:disabled { opacity: 0.5; cursor: not-allowed; }
      .secondary-button { padding: 8px 14px; background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; }
      .loading { padding: 48px; text-align: center; color: #6b7280; }
      .specialty { font-size: 12px; color: #6b7280; }
      .field-error { color: #dc2626; font-size: 12px; margin-top: 4px; display: block; }
      .error-message { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; font-size: 14px; margin-bottom: 12px; }
      .login-link { text-align: center; margin-top: 16px; font-size: 14px; color: #6b7280; }
      .login-link .link { color: #b87333; text-decoration: none; font-weight: 500; }
      .login-link .link:hover { text-decoration: underline; }
      .button { display: inline-block; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; cursor: pointer; }
      .button-dark { background: #2d2d2d; color: white; }
    `,
  ],
})
export class BookingComponent implements OnInit {
  tempName = ''
  tempEmail = ''
  tempNotes = ''
  steps = ['service', 'branch', 'staff', 'time', 'confirm'] as const

  showRegister = true
  regName = ''
  regEmail = ''
  regPassword = ''
  showRegPassword = false
  regLoading = false
  regError = ''
  regNameError = ''
  regEmailError = ''
  regPasswordError = ''

  constructor(public store: BookingStore, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.isAuthenticated) {
      this.loadBookingData()
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated()
  }

  loadBookingData(): void {
    if (this.isAuthenticated) {
      this.store.loadCategories()
      this.store.loadBranches()
    }
  }

  validateRegistration(): boolean {
    let valid = true
    this.regNameError = ''
    this.regEmailError = ''
    this.regPasswordError = ''

    if (!this.regName.trim() || this.regName.trim().length < 2) {
      this.regNameError = 'El nombre debe tener al menos 2 caracteres'
      valid = false
    }

    if (!this.regEmail.trim() || !this.regEmail.includes('@') || !this.regEmail.includes('.')) {
      this.regEmailError = 'Ingresa un correo electrónico válido'
      valid = false
    }

    if (!this.regPassword || this.regPassword.length < 6) {
      this.regPasswordError = 'La contraseña debe tener al menos 6 caracteres'
      valid = false
    }

    return valid
  }

  register(): void {
    if (!this.validateRegistration()) return
    this.regLoading = true
    this.regError = ''
    this.authService.register(this.regName.trim(), this.regEmail.trim(), this.regPassword).subscribe({
      next: () => {
        this.regLoading = false
        this.showRegister = false
        this.loadBookingData()
      },
      error: (err) => {
        this.regLoading = false
        this.regError = err.error?.error?.message || err.error?.message || 'Error al crear la cuenta'
      },
    })
  }

  isStepActive(step: typeof this.steps[number]): boolean {
    return this.store.currentStep() === step
  }

  isStepDone(step: typeof this.steps[number]): boolean {
    const idx = this.steps.indexOf(step)
    const currentIdx = this.steps.indexOf(this.store.currentStep())
    return currentIdx > idx
  }

  stepNumber(step: typeof this.steps[number]): number {
    return this.steps.indexOf(step) + 1
  }

  stepLabel(step: typeof this.steps[number]): string {
    const labels: Record<string, string> = { service: 'Servicio', branch: 'Sucursal', staff: 'Barbero', time: 'Hora', confirm: 'Confirmar' }
    return labels[step] || step
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  book(): void {
    this.store.book()
  }
}
