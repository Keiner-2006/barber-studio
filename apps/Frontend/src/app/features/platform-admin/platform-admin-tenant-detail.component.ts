import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { PlatformAdminApi } from './platform-admin.api'
import { PlatformAdminStore } from './platform-admin.store'
import { PA_STYLES } from './platform-admin.ui'
import { AUDIT_ACTION_LABELS, ROLE_NAMES, TenantDetail } from './platform-admin.models'
import { apiErrorMessage, businessTypeLabel, countryName, formatMoney, initials, relativeTime, shortDate, statusLabel } from './platform-admin.view-helpers'

type Tab = 'resumen' | 'sedes' | 'equipo' | 'auditoria'

const DAY_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const DAY_LABEL: Record<string, string> = { lunes: 'Lun', martes: 'Mar', miercoles: 'Mié', jueves: 'Jue', viernes: 'Vie', sabado: 'Sáb', domingo: 'Dom' }

@Component({
  selector: 'app-platform-admin-tenant-detail',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="pa">
      <a class="back" routerLink="/platform-admin/negocios"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span> Negocios registrados</a>

      @if (loading()) {
        <span class="sk" style="height:120px;margin:16px 0"></span>
        <div class="kpis">@for (i of [1, 2, 3, 4]; track i) { <span class="sk" style="height:110px"></span> }</div>
      } @else if (error()) {
        <div class="empty" style="margin-top:16px">
          <span class="material-symbols-outlined" aria-hidden="true">error</span>
          <strong>No se pudo cargar el negocio</strong>
          <p>{{ error() }}</p>
          <button class="btn" (click)="load()">Reintentar</button>
        </div>
      } @else if (tenant()) {
        @let t = tenant()!;
        <section class="hero">
          <span class="logo" [style.background]="t.branding?.primaryColor || null">
            @if (t.branding?.logoUrl) { <img [src]="t.branding!.logoUrl" alt="" /> } @else { {{ initials(t.tradeName) }} }
          </span>
          <div class="hero-text">
            <div class="title-row"><h1>{{ t.tradeName }}</h1><span class="chip" [attr.data-tone]="t.status">{{ statusLabel(t.status) }}</span></div>
            <p class="sub">{{ t.legalName }} · {{ businessTypeLabel(t.businessType) }} · {{ countryName(t.countryCode) }} · registrado {{ relativeTime(t.createdAt) }}</p>
          </div>
          <div class="hero-actions">
            <a class="btn" [href]="'/b/' + t.slug" target="_blank" rel="noopener"><span class="material-symbols-outlined" aria-hidden="true">open_in_new</span> Página pública</a>
            @if (t.status === 'active') {
              <button class="btn btn-danger" (click)="askStatus('suspended')"><span class="material-symbols-outlined" aria-hidden="true">block</span> Suspender</button>
            } @else if (t.status === 'suspended' || t.status === 'provisioning') {
              <button class="btn btn-primary" (click)="askStatus('active')"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span> Activar</button>
            }
          </div>
        </section>

        @if (pendingStatus(); as next) {
          <form class="card confirm" (ngSubmit)="confirmStatus()">
            <h2>{{ next === 'suspended' ? 'Suspender ' + t.tradeName : 'Activar ' + t.tradeName }}</h2>
            <p class="muted">{{ next === 'suspended'
              ? 'El propietario y su equipo dejarán de poder entrar al panel en menos de un minuto. Sus datos se conservan.'
              : 'El propietario y su equipo podrán volver a entrar al panel.' }}</p>
            <div class="field">
              <label for="reason">Motivo (queda en la auditoría)</label>
              <textarea id="reason" class="input" name="reason" [(ngModel)]="reason" required minlength="3" maxlength="300" placeholder="Ej.: falta de pago, solicitud del propietario…"></textarea>
            </div>
            @if (actionError(); as e) { <p class="err" role="alert">{{ e }}</p> }
            <div class="confirm-actions">
              <button type="button" class="btn" (click)="pendingStatus.set(null)">Cancelar</button>
              <button type="submit" class="btn" [class.btn-danger]="next === 'suspended'" [class.btn-primary]="next === 'active'" [disabled]="saving() || reason.trim().length < 3">
                {{ saving() ? 'Guardando…' : (next === 'suspended' ? 'Suspender negocio' : 'Activar negocio') }}
              </button>
            </div>
          </form>
        }
        @if (notice(); as n) { <div class="alert ok" role="status"><span class="material-symbols-outlined" aria-hidden="true">check_circle</span><span class="grow">{{ n }}</span></div> }

        <div class="tabs" role="tablist" aria-label="Secciones del negocio">
          @for (tab of tabs; track tab.id) {
            <button role="tab" class="tab" [class.on]="active() === tab.id" [attr.aria-selected]="active() === tab.id" (click)="active.set(tab.id)">
              <span class="material-symbols-outlined" aria-hidden="true">{{ tab.icon }}</span>{{ tab.label }}
              @if (tab.count !== undefined) { <b>{{ tab.count(t) }}</b> }
            </button>
          }
        </div>

        @switch (active()) {
          @case ('resumen') {
            <section class="kpis" aria-label="Uso del negocio">
              @for (k of usageKpis(); track k.label) {
                <article class="kpi">
                  <div class="kpi-top"><span class="kpi-label">{{ k.label }}</span><span class="kpi-icon"><span class="material-symbols-outlined" aria-hidden="true">{{ k.icon }}</span></span></div>
                  <strong class="kpi-value">{{ k.value }}</strong>
                  <p class="kpi-detail">{{ k.detail }}</p>
                </article>
              }
            </section>
            <div class="two">
              <section class="card">
                <h2>Datos del negocio</h2>
                <dl class="facts">
                  <div><dt>Nombre comercial</dt><dd>{{ t.tradeName }}</dd></div>
                  <div><dt>Razón social</dt><dd>{{ t.legalName }}</dd></div>
                  <div><dt>Slug</dt><dd>/{{ t.slug }}</dd></div>
                  <div><dt>Tipo</dt><dd>{{ businessTypeLabel(t.businessType) }}</dd></div>
                  <div><dt>Ubicación</dt><dd>{{ locationText() }}</dd></div>
                  <div><dt>WhatsApp</dt><dd>{{ t.whatsapp || '—' }}</dd></div>
                  <div><dt>Teléfono</dt><dd>{{ t.phone || '—' }}</dd></div>
                  <div><dt>Moneda · Zona horaria</dt><dd>{{ t.currencyCode }} · {{ t.timezone }}</dd></div>
                  <div><dt>Reservas online</dt><dd>{{ t.branding?.publicBookingEnabled ? 'Activadas' : 'Desactivadas' }}</dd></div>
                </dl>
              </section>
              <section class="card">
                <h2>Propietario</h2>
                @if (t.owner) {
                  <div class="ent owner"><span class="avatar">{{ initials(t.owner.name) }}</span><span><strong>{{ t.owner.name }}</strong><small>{{ t.owner.email }}</small></span></div>
                  <a class="btn" [href]="'mailto:' + t.owner.email"><span class="material-symbols-outlined" aria-hidden="true">mail</span> Escribir al propietario</a>
                } @else {
                  <p class="muted">Este negocio no tiene propietario asignado.</p>
                }
                @if (t.branding?.description) { <h2 class="mt">Descripción</h2><p class="muted">{{ t.branding!.description }}</p> }
                @if (socialLinks().length) {
                  <h2 class="mt">Redes</h2>
                  <ul class="social">@for (s of socialLinks(); track s.key) { <li><b>{{ s.key }}</b> {{ s.value }}</li> }</ul>
                }
              </section>
            </div>
          }
          @case ('sedes') {
            @if (!t.branches.length) {
              <div class="empty"><span class="material-symbols-outlined" aria-hidden="true">location_off</span><strong>Sin sedes</strong><p>El negocio aún no tiene sedes creadas.</p></div>
            } @else {
              <div class="branches">
                @for (b of t.branches; track b.id) {
                  <article class="card">
                    <div class="card-head">
                      <div><h2>{{ b.name }}</h2><p>{{ b.code }}</p></div>
                      <span class="chip" [attr.data-tone]="b.status">{{ b.status === 'active' ? 'Activa' : 'Inactiva' }}</span>
                    </div>
                    <p class="line"><span class="material-symbols-outlined" aria-hidden="true">location_on</span>{{ joinText(b.address, b.city) || 'Sin dirección' }}</p>
                    <p class="line"><span class="material-symbols-outlined" aria-hidden="true">call</span>{{ b.phone || 'Sin teléfono' }}</p>
                    <ul class="hours" aria-label="Horario">
                      @for (d of hoursOf(b.operatingHours); track d.day) { <li [class.closed]="!d.value"><span>{{ d.day }}</span><b>{{ d.value || 'Cerrado' }}</b></li> }
                    </ul>
                  </article>
                }
              </div>
            }
          }
          @case ('equipo') {
            <div class="two">
              <section class="card">
                <h2>Accesos al panel</h2>
                <p class="muted small">Cuentas con membresía en este negocio</p>
                <ul class="people">
                  @for (m of t.members; track m.email) {
                    <li class="ent">
                      <span class="avatar">{{ initials(m.name) }}</span>
                      <span><strong>{{ m.name }}</strong><small>{{ m.email }} · último acceso {{ relativeTime(m.lastLoginAt) }}</small></span>
                      <span class="role">{{ roleName(m.role) }}</span>
                    </li>
                  } @empty { <li class="muted">Sin cuentas asociadas.</li> }
                </ul>
              </section>
              <section class="card">
                <h2>Equipo de atención</h2>
                <p class="muted small">Barberos y personal que aparece en la agenda</p>
                <ul class="people">
                  @for (s of t.staff; track s.id) {
                    <li class="ent">
                      <span class="avatar">{{ initials(s.displayName) }}</span>
                      <span><strong>{{ s.displayName }}</strong><small>{{ s.branchName || 'Sin sede' }} · {{ s.isBookable ? 'Recibe reservas' : 'No recibe reservas' }}</small></span>
                      <span class="chip" [attr.data-tone]="s.status === 'active' ? 'active' : 'inactive'">{{ s.status === 'active' ? 'Activo' : 'Inactivo' }}</span>
                    </li>
                  } @empty { <li class="muted">Sin personal registrado.</li> }
                </ul>
              </section>
            </div>
          }
          @case ('auditoria') {
            <section class="card">
              <h2>Historial</h2>
              <p class="muted small">Acciones de administración sobre este negocio</p>
              @if (!t.audit.length) {
                <p class="muted">Aún no hay eventos registrados.</p>
              } @else {
                <ol class="timeline">
                  @for (e of t.audit; track e.id) {
                    <li>
                      <span class="dot" aria-hidden="true"></span>
                      <div>
                        <strong>{{ actionLabel(e.action) }}</strong>
                        <small class="muted">{{ shortDate(e.createdAt) }} · {{ relativeTime(e.createdAt) }}{{ metaOf(e.metadata).actorEmail ? ' · por ' + metaOf(e.metadata).actorEmail : '' }}</small>
                        @if (metaOf(e.metadata).reason) { <p>“{{ metaOf(e.metadata).reason }}”</p> }
                      </div>
                    </li>
                  }
                </ol>
              }
            </section>
          }
        }
      }
    </div>
  `,
  styles: [PA_STYLES, `
    .back { align-items: center; border-radius: 8px; color: var(--muted); display: inline-flex; font-size: 14px; font-weight: 600; gap: 6px; text-decoration: none; }
    .back:hover { color: var(--copper); }
    .hero { align-items: center; background: linear-gradient(135deg, #17100c, #3a2416); border-radius: 22px; color: #f6eee4; display: flex; flex-wrap: wrap; gap: 18px; margin: 16px 0 18px; padding: clamp(18px, 3vw, 28px); }
    .logo { align-items: center; background: rgba(224,154,104,.25); border-radius: 18px; color: #ffdbca; display: flex; flex: none; font: 800 24px 'Plus Jakarta Sans', sans-serif; height: 72px; justify-content: center; overflow: hidden; width: 72px; }
    .logo img { height: 100%; object-fit: cover; width: 100%; }
    .hero-text { flex: 1; min-width: 240px; }
    .title-row { align-items: center; display: flex; flex-wrap: wrap; gap: 12px; }
    .hero .sub { color: #d9cdc1; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .hero-actions .btn:not(.btn-primary):not(.btn-danger) { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.2); color: #f6eee4; }
    .confirm { border-color: #ecc3a6; margin-bottom: 16px; }
    .confirm .muted { margin: 6px 0 14px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px; }
    .tabs { border-bottom: 1px solid var(--line); display: flex; gap: 4px; margin-bottom: 18px; overflow-x: auto; }
    .tab { align-items: center; background: none; border: 0; border-bottom: 2px solid transparent; color: var(--muted); cursor: pointer; display: inline-flex; flex: none; font: 600 15px 'Plus Jakarta Sans', sans-serif; gap: 6px; margin-bottom: -1px; min-height: 46px; padding: 0 14px; }
    .tab b { background: #f1ece4; border-radius: 999px; color: var(--ink); font-size: 12px; padding: 1px 8px; }
    .tab.on { border-bottom-color: var(--copper); color: var(--ink); }
    .tab.on .material-symbols-outlined { color: var(--copper); }
    .two { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
    .facts { display: grid; gap: 0; margin: 12px 0 0; }
    .facts div { border-bottom: 1px solid #f0ebe3; display: flex; gap: 12px; justify-content: space-between; padding: 10px 0; }
    .facts div:last-child { border-bottom: 0; }
    .facts dt { color: var(--muted); font-size: 14px; }
    .facts dd { font-weight: 600; margin: 0; text-align: right; }
    .owner { margin: 14px 0; }
    .mt { margin-top: 20px; }
    .social { list-style: none; margin: 8px 0 0; padding: 0; }
    .social li { padding: 4px 0; }
    .social b { color: var(--muted); display: inline-block; min-width: 90px; text-transform: capitalize; }
    .branches { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    .line { align-items: center; color: var(--muted); display: flex; gap: 8px; margin: 6px 0; }
    .hours { display: grid; gap: 4px; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); list-style: none; margin: 14px 0 0; padding: 0; }
    .hours li { background: var(--paper); border-radius: 10px; display: flex; font-size: 13px; justify-content: space-between; padding: 6px 10px; }
    .hours li.closed { color: var(--muted-2); }
    .hours b { font-variant-numeric: tabular-nums; }
    .small { font-size: 14px; margin: 2px 0 12px; }
    .people { display: grid; gap: 6px; list-style: none; margin: 0; padding: 0; }
    .people li.ent { border-radius: 12px; padding: 8px; }
    .people li.ent > span:nth-child(2) { flex: 1; min-width: 0; }
    .role { background: var(--copper-soft); border-radius: 999px; color: #74361f; font-size: 12px; font-weight: 700; padding: 3px 10px; white-space: nowrap; }
    .timeline { list-style: none; margin: 8px 0 0; padding: 0; }
    .timeline li { display: flex; gap: 14px; padding: 10px 0; position: relative; }
    .timeline li:not(:last-child)::after { background: var(--line); bottom: -10px; content: ''; left: 5px; position: absolute; top: 26px; width: 2px; }
    .dot { background: var(--copper); border: 3px solid var(--copper-soft); border-radius: 50%; flex: none; height: 12px; margin-top: 5px; width: 12px; }
    .timeline strong { display: block; }
    .timeline small { display: block; font-size: 13px; }
    .timeline p { background: var(--paper); border-radius: 10px; margin: 6px 0 0; padding: 8px 10px; }
  `],
})
export class PlatformAdminTenantDetailComponent implements OnInit {
  private route = inject(ActivatedRoute)
  private api = inject(PlatformAdminApi)
  private store = inject(PlatformAdminStore)

  readonly tenant = signal<TenantDetail | null>(null)
  readonly loading = signal(true)
  readonly error = signal<string | null>(null)
  readonly active = signal<Tab>('resumen')
  readonly pendingStatus = signal<'active' | 'suspended' | null>(null)
  readonly saving = signal(false)
  readonly actionError = signal<string | null>(null)
  readonly notice = signal<string | null>(null)
  reason = ''

  readonly tabs: { id: Tab; label: string; icon: string; count?: (t: TenantDetail) => number }[] = [
    { id: 'resumen', label: 'Resumen', icon: 'insights' },
    { id: 'sedes', label: 'Sedes', icon: 'location_on', count: (t) => t.branches.length },
    { id: 'equipo', label: 'Equipo y accesos', icon: 'group', count: (t) => t.members.length + t.staff.length },
    { id: 'auditoria', label: 'Auditoría', icon: 'history', count: (t) => t.audit.length },
  ]

  readonly usageKpis = computed(() => {
    const u = this.tenant()?.usage
    if (!u) return []
    return [
      { label: 'Citas (30 días)', value: String(u.appointments30d), detail: `${u.appointmentsTotal} en total · última ${relativeTime(u.lastAppointmentAt)}`, icon: 'event_available' },
      { label: 'Ingresos (30 días)', value: formatMoney(u.revenue30d), detail: 'Citas completadas', icon: 'payments' },
      { label: 'Clientes', value: String(u.customers), detail: 'Registrados en el negocio', icon: 'person' },
      { label: 'Catálogo y equipo', value: `${u.services} · ${u.staff}`, detail: `servicios · personas activas · ${u.branches} sede${u.branches === 1 ? '' : 's'}`, icon: 'content_cut' },
    ]
  })

  readonly locationText = computed(() => {
    const t = this.tenant()
    const b = t?.branches[0]
    const l = t?.location
    return [b?.address ?? l?.address, b?.city ?? l?.city].filter(Boolean).join(', ') || '—'
  })

  readonly socialLinks = computed(() => Object.entries(this.tenant()?.branding?.socialLinks ?? {}).map(([key, value]) => ({ key, value })))

  readonly initials = initials
  readonly businessTypeLabel = businessTypeLabel
  readonly countryName = countryName
  readonly relativeTime = relativeTime
  readonly shortDate = shortDate
  readonly statusLabel = statusLabel

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? ''
    this.loading.set(true)
    this.error.set(null)
    this.api.getTenant(id).subscribe({
      next: (res) => {
        this.tenant.set(res.data)
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'No se pudo cargar el negocio'))
        this.loading.set(false)
      },
    })
  }

  askStatus(status: 'active' | 'suspended'): void {
    this.reason = ''
    this.actionError.set(null)
    this.notice.set(null)
    this.pendingStatus.set(status)
  }

  confirmStatus(): void {
    const t = this.tenant()
    const next = this.pendingStatus()
    if (!t || !next || this.reason.trim().length < 3) return
    this.saving.set(true)
    this.actionError.set(null)
    this.api.setTenantStatus(t.id, next, this.reason.trim()).subscribe({
      next: () => {
        this.saving.set(false)
        this.pendingStatus.set(null)
        this.store.patchTenant(t.id, { status: next })
        this.notice.set(next === 'suspended' ? 'Negocio suspendido. El cambio quedó en la auditoría.' : 'Negocio activado. El cambio quedó en la auditoría.')
        this.load()
      },
      error: (err) => {
        this.saving.set(false)
        this.actionError.set(apiErrorMessage(err, 'No se pudo cambiar el estado'))
      },
    })
  }

  hoursOf(hours: Record<string, string> | null): { day: string; value: string | null }[] {
    return DAY_ORDER.map((d) => ({ day: DAY_LABEL[d], value: hours?.[d] ?? null }))
  }

  joinText(...parts: (string | null | undefined)[]): string {
    return parts.filter(Boolean).join(', ')
  }

  roleName(role: string): string {
    return ROLE_NAMES[role] ?? role
  }

  actionLabel(action: string): string {
    return AUDIT_ACTION_LABELS[action] ?? action
  }

  metaOf(raw: string | null): { reason?: string; actorEmail?: string } {
    if (!raw) return {}
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
}
