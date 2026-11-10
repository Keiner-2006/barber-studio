import { Component, OnInit, computed, inject } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { PlatformAdminStore } from './platform-admin.store'
import { PA_STYLES } from './platform-admin.ui'
import { businessTypeLabel, countryName, initials, relativeTime, statusLabel } from './platform-admin.view-helpers'

@Component({
  selector: 'app-platform-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pa">
      <header class="head">
        <div>
          <p class="eyebrow">{{ today }}</p>
          <h1>Hola{{ firstName() ? ', ' + firstName() : '' }}<em>.</em></h1>
          <p class="sub">Así va la plataforma: negocios registrados, su estado y la actividad reciente.</p>
        </div>
        <div class="actions">
          <button class="btn" (click)="store.refresh()" [disabled]="store.loading()">
            <span class="material-symbols-outlined" aria-hidden="true">refresh</span> Actualizar
          </button>
          <a class="btn btn-primary" routerLink="/platform-admin/negocios/nuevo">
            <span class="material-symbols-outlined" aria-hidden="true">add_business</span> Agregar negocio
          </a>
        </div>
      </header>

      @if (store.error(); as error) {
        <div class="alert error" role="alert">
          <span class="material-symbols-outlined" aria-hidden="true">error</span><span class="grow">{{ error }}</span>
          <button (click)="store.clearError()" aria-label="Cerrar aviso"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
        </div>
      }

      <section class="kpis" aria-label="Indicadores">
        @for (k of kpis(); track k.label) {
          <article class="kpi">
            <div class="kpi-top"><span class="kpi-label">{{ k.label }}</span><span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">{{ k.icon }}</span></span></div>
            @if (store.loading() && store.totalTenants() === null) { <span class="sk" style="height:34px;width:50%"></span> }
            @else { <strong class="kpi-value">{{ k.value }}</strong> }
            <p class="kpi-detail">{{ k.detail }}</p>
          </article>
        }
      </section>

      <div class="grid">
        <section class="card">
          <div class="card-head">
            <div><h2>Negocios recientes</h2><p>Últimos registros en la plataforma</p></div>
            <a class="link" routerLink="/platform-admin/negocios">Ver todos <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>
          </div>
          @if (store.loading() && !store.tenants().length) {
            @for (i of [1, 2, 3]; track i) { <span class="sk" style="height:58px;margin-bottom:8px"></span> }
          } @else if (!store.recentTenants().length) {
            <div class="empty">
              <span class="material-symbols-outlined" aria-hidden="true">storefront</span>
              <strong>Aún no hay negocios</strong>
              <p>Cuando una barbería se inscriba aparecerá aquí.</p>
            </div>
          } @else {
            <ul class="list">
              @for (t of store.recentTenants(); track t.id) {
                <li>
                  <button class="row" (click)="open(t.id)">
                    <span class="ent">
                      <span class="avatar" [style.background]="t.branding?.primaryColor || null" [class.has-color]="!!t.branding?.primaryColor">
                        @if (t.branding?.logoUrl) { <img [src]="t.branding!.logoUrl" alt="" /> } @else { {{ initials(t.tradeName) }} }
                      </span>
                      <span><strong>{{ t.tradeName }}</strong><small>{{ businessTypeLabel(t.businessType) }} · {{ t.city || countryName(t.countryCode) }}</small></span>
                    </span>
                    <span class="row-end">
                      <span class="chip" [attr.data-tone]="t.status">{{ statusLabel(t.status) }}</span>
                      <small class="muted">{{ relativeTime(t.createdAt) }}</small>
                    </span>
                  </button>
                </li>
              }
            </ul>
          }
        </section>

        <div class="side">
          <section class="card">
            <div class="card-head"><div><h2>Estado de los negocios</h2><p>{{ store.totalTenants() ?? 0 }} en total</p></div></div>
            <ul class="bars">
              @for (s of store.statusDistribution(); track s.status) {
                @if (s.count > 0 || s.status === 'active' || s.status === 'suspended') {
                  <li>
                    <div class="bar-meta"><span class="chip" [attr.data-tone]="s.status">{{ s.label }}</span><b>{{ s.count }}</b></div>
                    <div class="track"><div class="fill" [attr.data-tone]="s.status" [style.width.%]="s.ratio * 100"></div></div>
                  </li>
                }
              }
            </ul>
          </section>

          <section class="card">
            <div class="card-head"><div><h2>Por país</h2><p>Dónde están los negocios</p></div></div>
            @if (!store.countryDistribution().length) {
              <p class="muted" style="margin:0">Sin datos todavía.</p>
            } @else {
              <ul class="bars">
                @for (c of store.countryDistribution(); track c.code) {
                  <li>
                    <div class="bar-meta"><span>{{ countryName(c.code) }}</span><b>{{ c.count }}</b></div>
                    <div class="track"><div class="fill" [style.width.%]="c.ratio * 100"></div></div>
                  </li>
                }
              </ul>
            }
          </section>

          @if (store.suspendedTenants().length) {
            <section class="card attention">
              <div class="card-head"><div><h2>Requieren atención</h2><p>Negocios suspendidos</p></div></div>
              <ul class="list compact">
                @for (t of store.suspendedTenants(); track t.id) {
                  <li><a class="mini" [routerLink]="['/platform-admin/negocios', t.id]">{{ t.tradeName }} <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></a></li>
                }
              </ul>
            </section>
          }
        </div>
      </div>
    </div>
  `,
  styles: [PA_STYLES, `
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .grid { display: grid; gap: 20px; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); }
    .side { align-content: start; display: grid; gap: 20px; }
    .link { align-items: center; color: var(--copper); display: inline-flex; flex: none; font-size: 14px; font-weight: 700; gap: 4px; text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .list { display: grid; gap: 4px; list-style: none; margin: 0; padding: 0; }
    .row { align-items: center; background: none; border: 0; border-radius: 12px; color: inherit; cursor: pointer; display: flex; font: inherit; gap: 12px; justify-content: space-between; padding: 10px; text-align: left; width: 100%; }
    .row:hover { background: #fcf9f4; }
    .row .ent > span:last-child { min-width: 0; }
    .row-end { align-items: flex-end; display: flex; flex: none; flex-direction: column; gap: 4px; }
    .row-end small { font-size: 12px; }
    .avatar.has-color { color: #fff; }
    .bars { display: grid; gap: 14px; list-style: none; margin: 0; padding: 0; }
    .bar-meta { align-items: center; display: flex; font-size: 14px; justify-content: space-between; margin-bottom: 6px; }
    .bar-meta b { font-variant-numeric: tabular-nums; }
    .track { background: #f1ece4; border-radius: 4px; height: 10px; overflow: hidden; }
    .fill { background: var(--copper); border-radius: 0 4px 4px 0; height: 100%; min-width: 2px; transition: width .4s ease; }
    .fill[data-tone='active'] { background: #1f8a57; }
    .fill[data-tone='provisioning'] { background: #c98500; }
    .fill[data-tone='suspended'] { background: #c0392b; }
    .fill[data-tone='deleting'], .fill[data-tone='deleted'] { background: #8a837b; }
    .attention { border-color: #f2bdb8; }
    .mini { align-items: center; border-radius: 10px; display: flex; font-weight: 600; justify-content: space-between; padding: 8px 10px; text-decoration: none; }
    .mini:hover { background: var(--red-bg); }
    @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }
  `],
})
export class PlatformAdminDashboardComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  private router = inject(Router)

  readonly today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  readonly firstName = computed(() => this.store.viewer()?.name?.split(' ')[0] ?? '')

  readonly kpis = computed(() => {
    const counts = this.store.countsByStatus()
    const total = this.store.totalTenants() ?? 0
    const active = counts.active ?? 0
    return [
      { label: 'Negocios registrados', value: String(total), detail: `${this.store.countryDistribution().length || 0} países`, icon: 'storefront' },
      { label: 'Activos', value: String(active), detail: total ? `${Math.round((active / total) * 100)}% del total` : 'Sin negocios aún', icon: 'verified' },
      { label: 'Nuevos (30 días)', value: String(this.store.newLast30d()), detail: 'Inscritos el último mes', icon: 'trending_up' },
      { label: 'Suspendidos', value: String(counts.suspended ?? 0), detail: 'Sin acceso al panel', icon: 'block' },
    ]
  })

  readonly initials = initials
  readonly businessTypeLabel = businessTypeLabel
  readonly countryName = countryName
  readonly relativeTime = relativeTime
  readonly statusLabel = statusLabel

  ngOnInit(): void {
    this.store.load()
  }

  open(id: string): void {
    this.router.navigate(['/platform-admin/negocios', id])
  }
}
