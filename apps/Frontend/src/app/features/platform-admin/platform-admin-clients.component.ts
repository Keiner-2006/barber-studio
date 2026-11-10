import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { PlatformAdminApi } from './platform-admin.api'
import { PA_STYLES } from './platform-admin.ui'
import { PlatformOwner } from './platform-admin.models'
import { apiErrorMessage, initials, relativeTime, shortDate, statusLabel } from './platform-admin.view-helpers'

const USER_STATUS: Record<PlatformOwner['status'], string> = { active: 'Activa', invited: 'Invitada', blocked: 'Bloqueada' }

@Component({
  selector: 'app-platform-admin-clients',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pa">
      <header class="head">
        <div>
          <p class="eyebrow">Clientes de la plataforma</p>
          <h1>Propietarios<em>.</em></h1>
          <p class="sub">Las personas dueñas de cada barbería, su cuenta y sus negocios.</p>
        </div>
        <button class="btn" (click)="load()" [disabled]="loading()"><span class="material-symbols-outlined" aria-hidden="true">refresh</span> Actualizar</button>
      </header>

      <section class="kpis" aria-label="Indicadores">
        <article class="kpi"><div class="kpi-top"><span class="kpi-label">Propietarios</span><span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">groups</span></span></div><strong class="kpi-value">{{ owners().length }}</strong><p class="kpi-detail">Con al menos un negocio</p></article>
        <article class="kpi"><div class="kpi-top"><span class="kpi-label">Con varios negocios</span><span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">store</span></span></div><strong class="kpi-value">{{ multi() }}</strong><p class="kpi-detail">Dueños de 2 o más</p></article>
        <article class="kpi"><div class="kpi-top"><span class="kpi-label">Activos este mes</span><span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">login</span></span></div><strong class="kpi-value">{{ recentLogins() }}</strong><p class="kpi-detail">Entraron en los últimos 30 días</p></article>
      </section>

      <div class="card">
        <label class="search" style="margin-bottom:12px">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <input type="search" placeholder="Buscar por nombre, correo, teléfono o negocio" aria-label="Buscar propietarios" [value]="term()" (input)="term.set($any($event.target).value)" />
        </label>

        @if (loading()) {
          @for (i of [1, 2, 3]; track i) { <span class="sk" style="height:56px;margin-bottom:8px"></span> }
        } @else if (error()) {
          <div class="alert error" role="alert"><span class="material-symbols-outlined" aria-hidden="true">error</span><span class="grow">{{ error() }}</span><button (click)="load()">Reintentar</button></div>
        } @else if (!filtered().length) {
          <div class="empty">
            <span class="material-symbols-outlined" aria-hidden="true">person_search</span>
            <strong>{{ term() ? 'Ningún propietario coincide' : 'Aún no hay propietarios' }}</strong>
            <p>{{ term() ? 'Prueba con otra búsqueda.' : 'Aparecerán cuando se inscriba el primer negocio.' }}</p>
          </div>
        } @else {
          <div class="table-wrap">
            <table class="data">
              <thead><tr><th>Propietario</th><th>Contacto</th><th>Negocios</th><th>Cuenta</th><th>Último acceso</th></tr></thead>
              <tbody>
                @for (o of filtered(); track o.id) {
                  <tr>
                    <td><span class="ent"><span class="avatar">{{ initials(o.name) }}</span><span><strong>{{ o.name || 'Sin nombre' }}</strong><small>{{ o.email }}</small></span></span></td>
                    <td><span class="cell">{{ o.whatsapp || o.phone || '—' }}</span><small class="cell muted">desde {{ shortDate(o.createdAt) }}</small></td>
                    <td>
                      <div class="biz">
                        @for (t of o.tenants; track t.id) {
                          <a class="biz-link" [routerLink]="['/platform-admin/negocios', t.id]">{{ t.tradeName }} <span class="chip" [attr.data-tone]="t.status">{{ statusLabel(t.status) }}</span></a>
                        }
                      </div>
                    </td>
                    <td><span class="chip" [attr.data-tone]="o.status">{{ userStatus(o.status) }}</span></td>
                    <td><span class="cell">{{ relativeTime(o.lastLoginAt) }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [PA_STYLES, `
    .cell { display: block; }
    small.cell { font-size: 13px; }
    .biz { display: grid; gap: 6px; }
    .biz-link { align-items: center; display: inline-flex; font-weight: 600; gap: 8px; text-decoration: none; }
    .biz-link:hover { color: var(--copper); }
  `],
})
export class PlatformAdminClientsComponent implements OnInit {
  private api = inject(PlatformAdminApi)

  readonly owners = signal<PlatformOwner[]>([])
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  readonly term = signal('')

  readonly filtered = computed(() => {
    const q = this.term().trim().toLowerCase()
    if (!q) return this.owners()
    return this.owners().filter((o) =>
      [o.name, o.email, o.phone ?? '', o.whatsapp ?? '', ...o.tenants.map((t) => t.tradeName)].join(' ').toLowerCase().includes(q),
    )
  })
  readonly multi = computed(() => this.owners().filter((o) => o.tenants.length > 1).length)
  readonly recentLogins = computed(() => {
    const since = Date.now() - 30 * 86_400_000
    return this.owners().filter((o) => o.lastLoginAt && new Date(o.lastLoginAt).getTime() >= since).length
  })

  readonly initials = initials
  readonly relativeTime = relativeTime
  readonly shortDate = shortDate
  readonly statusLabel = statusLabel

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.loading.set(true)
    this.error.set(null)
    this.api.getOwners().subscribe({
      next: (res) => {
        this.owners.set(res.data ?? [])
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'No se pudieron cargar los propietarios'))
        this.loading.set(false)
      },
    })
  }

  userStatus(s: PlatformOwner['status']): string {
    return USER_STATUS[s] ?? s
  }
}
