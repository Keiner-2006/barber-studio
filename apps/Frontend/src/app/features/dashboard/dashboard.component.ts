import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { DashboardStore } from './dashboard.store'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard min-h-screen bg-brown text-cream">
      <!-- Header -->
      <header class="dashboard-header px-6 py-8 md:px-10 lg:px-12">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p class="text-xs font-semibold text-secondary tracking-wider uppercase mb-1">
              {{ store.todayLabel }}
            </p>
            <h1 class="text-3xl md:text-4xl font-display font-semibold text-cream tracking-tight">
              Buenos días, {{ store.userName() }}<span class="text-primary">.</span>
            </h1>
            <p class="text-sm text-on-surface-variant mt-2">
              Resumen del día en tu estudio
            </p>
          </div>
          <button class="px-5 py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary-foreground transition-colors flex items-center gap-2" routerLink="/agenda">
            <span class="text-lg">+</span> Nueva reserva
          </button>
        </div>
      </header>

      <!-- Today metrics strip -->
      <div class="px-6 md:px-10 lg:px-12 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (m of store.todayMetrics(); track m.label) {
            <div class="bg-brown-light border border-outline rounded-xl p-5">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm text-secondary">{{ m.label }}</span>
                <div class="w-9 h-9 rounded-lg {{ m.color.replace('text-', 'bg-') }}/20 flex items-center justify-center">
                  {{ m.icon }}
                </div>
              </div>
              <div class="text-2xl font-display font-bold text-cream">{{ m.value }}</div>
            </div>
          }
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="px-6 md:px-10 lg:px-12 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (kpi of store.kpis(); track kpi.label) {
            <div class="bg-brown-light border border-outline rounded-xl p-5 hover:border-primary-foreground/30 transition-colors">
              <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-lg {{ kpi.bg }} flex items-center justify-center">
                  {{ kpi.icon }}
                </div>
                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span class="text-[10px] text-primary font-bold">▲</span>
                </div>
              </div>
              <div class="text-3xl font-display font-bold text-cream">{{ kpi.value }}</div>
              <p class="text-xs text-secondary mt-1">{{ kpi.detail }}</p>
              <p class="text-[10px] font-bold {{ kpi.color }} mt-2 flex items-center gap-1">
                {{ kpi.trend }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Content Grid -->
      <div class="px-6 md:px-10 lg:px-12 mb-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Today's appointments (lg: 8 cols) -->
        <div class="lg:col-span-8 bg-brown-light border border-outline rounded-xl overflow-hidden shadow-sm">
          <div class="p-5 border-b border-outline">
            <h3 class="text-lg font-display font-bold text-cream">Agenda de hoy</h3>
            <p class="text-xs text-on-surface-variant mt-1">
              {{ store.appointmentRows().length }} citas programadas
            </p>
          </div>
          <div class="divide-y divide-outline">
            @if (store.appointmentRows().length === 0) {
              <div class="p-8 text-center">
                <p class="text-secondary text-sm">No hay citas para hoy</p>
                <p class="text-xs text-on-surface-variant mt-1">Relájate, hoy es un día tranquilo.</p>
              </div>
            } @else {
              @for (appt of store.appointmentRows(); track appt.id) {
                <div class="p-5 flex items-center justify-between group hover:bg-brown-hover transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full {{ appt.avatarColor }} flex items-center justify-center text-sm font-bold">
                      {{ appt.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-cream">{{ appt.name }}</p>
                      <p class="text-xs text-on-surface-variant">{{ appt.service }} · {{ appt.barber }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-mono text-secondary">{{ appt.time }}</span>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border {{ appt.statusClass }}">
                      {{ appt.status }}
                    </span>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Weekly chart + top customers (lg: 4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <!-- Weekly chart -->
          <div class="bg-brown-light border border-outline rounded-xl p-5 shadow-sm">
            <h3 class="text-lg font-display font-bold text-cream mb-5">Rendimiento semanal</h3>
            <div class="flex items-end justify-between gap-2 h-40">
              @for (day of store.weekData(); track day.label) {
                <div class="flex flex-col items-center gap-2 w-full">
                  <span class="text-[10px] text-secondary">{{ day.value }}</span>
                  <div
                    class="w-full max-w-[40px] rounded-t-lg transition-all duration-500 bg-primary"
                    [class.opacity-100]="day.isToday"
                    [class.opacity-30]="!day.isToday"
                    [style.height.%]="day.height"
                  ></div>
                  <span class="text-[10px] text-secondary">{{ day.label }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Top customers served today -->
          <div class="bg-brown-light border border-outline rounded-xl p-5 shadow-sm">
            <h3 class="text-lg font-display font-bold text-cream mb-4">Clientes atendidos hoy</h3>
            @if (store.topCustomers().length === 0) {
              <p class="text-secondary text-sm text-center py-4">Aún no hay clientes atendidos hoy</p>
            } @else {
              <div class="space-y-3">
                @for (c of store.topCustomers(); track c.name) {
                  <div class="flex items-center justify-between p-3 bg-brown hover:bg-brown-hover rounded-lg transition-colors cursor-pointer">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {{ c.name.charAt(0) }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-cream">{{ c.name }}</p>
                        <p class="text-xs text-on-surface-variant">{{ c.service }}</p>
                      </div>
                    </div>
                    <span class="text-xs font-mono text-primary font-bold">{{ store.formatPrice(c.price) }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  constructor(public store: DashboardStore) {}

  ngOnInit(): void {
    this.store.load()
  }
}
