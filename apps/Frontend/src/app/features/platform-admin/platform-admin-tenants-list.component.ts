import { Component, OnInit, inject } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { PlatformAdminStore } from './platform-admin.store'
import { PA_STYLES } from './platform-admin.ui'
import { PAGE_SIZE_OPTIONS, TENANT_STATUS_ORDER, TenantStatus } from './platform-admin.models'
import { businessTypeLabel, countryName, downloadCsv, initials, relativeTime, shortDate, statusLabel } from './platform-admin.view-helpers'

@Component({
  selector: 'app-platform-admin-tenants-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="pa">
      <header class="head">
        <div>
          <p class="eyebrow">Directorio</p>
          <h1>Negocios registrados<em>.</em></h1>
          <p class="sub">Busca, filtra y abre cualquier barbería inscrita en la plataforma.</p>
        </div>
        <div class="actions">
          <button class="btn" (click)="exportCsv()" [disabled]="!store.filteredTenants().length">
            <span class="material-symbols-outlined" aria-hidden="true">download</span> Exportar CSV
          </button>
          <a class="btn btn-primary" routerLink="/platform-admin/negocios/nuevo">
            <span class="material-symbols-outlined" aria-hidden="true">add_business</span> Agregar negocio
          </a>
        </div>
      </header>

      @if (store.error(); as error) {
        <div class="alert error" role="alert">
          <span class="material-symbols-outlined" aria-hidden="true">error</span><span class="grow">{{ error }}</span>
          <button (click)="store.refresh()">Reintentar</button>
        </div>
      }

      <section class="toolbar card" aria-label="Filtros">
        <label class="search grow">
          <span class="material-symbols-outlined" aria-hidden="true">search</span>
          <input type="search" placeholder="Buscar por nombre, slug, ciudad, propietario o teléfono" aria-label="Buscar negocios"
                 [value]="store.filters().search" (input)="store.setSearch($any($event.target).value)" />
        </label>
        <select class="input country" aria-label="Filtrar por país" [value]="store.filters().country ?? ''" (change)="store.setCountryFilter($any($event.target).value || null)">
          <option value="">Todos los países</option>
          @for (code of store.countryOptions(); track code) { <option [value]="code">{{ countryName(code) }}</option> }
        </select>
        <div class="view" role="group" aria-label="Vista">
          <button class="btn btn-icon" [class.on]="store.viewMode() === 'table'" (click)="store.setViewMode('table')" aria-label="Vista de tabla" [attr.aria-pressed]="store.viewMode() === 'table'"><span class="material-symbols-outlined" aria-hidden="true">table_rows</span></button>
          <button class="btn btn-icon" [class.on]="store.viewMode() === 'grid'" (click)="store.setViewMode('grid')" aria-label="Vista de tarjetas" [attr.aria-pressed]="store.viewMode() === 'grid'"><span class="material-symbols-outlined" aria-hidden="true">grid_view</span></button>
        </div>
        <div class="chips" role="group" aria-label="Filtrar por estado">
          <button class="pill" [class.on]="!store.filters().status" (click)="store.setStatusFilter(null)" [attr.aria-pressed]="!store.filters().status">
            Todos <b>{{ store.totalTenants() ?? 0 }}</b>
          </button>
          @for (s of statuses; track s) {
            @if ((store.countsByStatus()[s] ?? 0) > 0) {
              <button class="pill" [class.on]="store.filters().status === s" (click)="store.setStatusFilter(s)" [attr.aria-pressed]="store.filters().status === s">
                {{ statusLabel(s) }} <b>{{ store.countsByStatus()[s] }}</b>
              </button>
            }
          }
          @if (store.hasActiveFilters()) {
            <button class="clear" (click)="store.clearFilters()"><span class="material-symbols-outlined" aria-hidden="true">filter_alt_off</span> Limpiar filtros</button>
          }
        </div>
      </section>

      @if (store.loading() && !store.tenants().length) {
        <div class="card">@for (i of [1, 2, 3, 4, 5]; track i) { <span class="sk" style="height:52px;margin-bottom:8px"></span> }</div>
      } @else if (!store.filteredTenants().length) {
        <div class="empty">
          <span class="material-symbols-outlined" aria-hidden="true">{{ store.hasActiveFilters() ? 'search_off' : 'storefront' }}</span>
          <strong>{{ store.hasActiveFilters() ? 'Ningún negocio coincide' : 'Aún no hay negocios registrados' }}</strong>
          <p>{{ store.hasActiveFilters() ? 'Prueba con otra búsqueda o limpia los filtros.' : 'Las barberías que se inscriban aparecerán aquí.' }}</p>
        </div>
      } @else if (store.viewMode() === 'table') {
        <div class="card flush">
          <div class="table-wrap">
            <table class="data">
              <thead>
                <tr><th>Negocio</th><th>Propietario</th><th>Ubicación</th><th>Contacto</th><th>Estado</th><th>Registro</th></tr>
              </thead>
              <tbody>
                @for (t of store.pagedTenants(); track t.id) {
                  <tr class="clickable" tabindex="0" (click)="open(t.id)" (keydown.enter)="open(t.id)" [attr.aria-label]="'Abrir ' + t.tradeName">
                    <td>
                      <span class="ent">
                        <span class="avatar" [style.background]="t.branding?.primaryColor || null" [class.has-color]="!!t.branding?.primaryColor">
                          @if (t.branding?.logoUrl) { <img [src]="t.branding!.logoUrl" alt="" /> } @else { {{ initials(t.tradeName) }} }
                        </span>
                        <span><strong>{{ t.tradeName }}</strong><small>/{{ t.slug }} · {{ businessTypeLabel(t.businessType) }}</small></span>
                      </span>
                    </td>
                    <td>
                      @if (t.owner) { <strong class="cell">{{ t.owner.name }}</strong><small class="cell muted">{{ t.owner.email }}</small> }
                      @else { <span class="muted">Sin propietario</span> }
                    </td>
                    <td><span class="cell">{{ t.city || '—' }}</span><small class="cell muted">{{ countryName(t.countryCode) }}</small></td>
                    <td><span class="cell">{{ t.whatsapp || t.phone || '—' }}</span></td>
                    <td><span class="chip" [attr.data-tone]="t.status">{{ statusLabel(t.status) }}</span></td>
                    <td><span class="cell">{{ shortDate(t.createdAt) }}</span><small class="cell muted">{{ relativeTime(t.createdAt) }}</small></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <div class="cards">
          @for (t of store.pagedTenants(); track t.id) {
            <a class="tcard" [routerLink]="['/platform-admin/negocios', t.id]">
              <div class="tcard-top" [style.background]="t.branding?.primaryColor || null">
                <span class="avatar big">@if (t.branding?.logoUrl) { <img [src]="t.branding!.logoUrl" alt="" /> } @else { {{ initials(t.tradeName) }} }</span>
                <span class="chip" [attr.data-tone]="t.status">{{ statusLabel(t.status) }}</span>
              </div>
              <div class="tcard-body">
                <strong>{{ t.tradeName }}</strong>
                <small class="muted">/{{ t.slug }}</small>
                <dl>
                  <div><dt>Propietario</dt><dd>{{ t.owner?.name || '—' }}</dd></div>
                  <div><dt>Ubicación</dt><dd>{{ t.city || countryName(t.countryCode) }}</dd></div>
                  <div><dt>Registro</dt><dd>{{ relativeTime(t.createdAt) }}</dd></div>
                </dl>
              </div>
            </a>
          }
        </div>
      }

      @if (store.filteredTenants().length) {
        <nav class="pager" aria-label="Paginación">
          <span class="muted">Mostrando {{ store.pagination().from }}–{{ store.pagination().to }} de {{ store.pagination().total }}</span>
          <label class="size">Por página
            <select class="input" [value]="store.pageSize()" (change)="store.setPageSize(+$any($event.target).value)">
              @for (n of pageSizes; track n) { <option [value]="n">{{ n }}</option> }
            </select>
          </label>
          <div class="pages">
            <button class="btn btn-icon" (click)="store.setPage(store.pagination().page - 1)" [disabled]="store.pagination().page <= 1" aria-label="Página anterior"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>
            <span class="pg">{{ store.pagination().page }} / {{ store.pagination().totalPages }}</span>
            <button class="btn btn-icon" (click)="store.setPage(store.pagination().page + 1)" [disabled]="store.pagination().page >= store.pagination().totalPages" aria-label="Página siguiente"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>
          </div>
        </nav>
      }
    </div>
  `,
  styles: [PA_STYLES, `
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .toolbar { align-items: center; display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .toolbar .grow { flex: 1 1 320px; }
    .country { flex: 0 1 200px; }
    .view { display: flex; gap: 6px; }
    .view .on { background: var(--ink); border-color: var(--ink); color: #fff; }
    .chips { align-items: center; display: flex; flex-basis: 100%; flex-wrap: wrap; gap: 8px; }
    .pill { align-items: center; background: #fff; border: 1.5px solid var(--line); border-radius: 999px; color: var(--muted); cursor: pointer; display: inline-flex; font: 600 14px 'Plus Jakarta Sans', sans-serif; gap: 8px; min-height: 36px; padding: 0 14px; }
    .pill b { background: #f1ece4; border-radius: 999px; color: var(--ink); font-size: 12px; padding: 1px 8px; }
    .pill.on { background: var(--ink); border-color: var(--ink); color: #fff; }
    .pill.on b { background: rgba(255,255,255,.18); color: #fff; }
    .clear { align-items: center; background: none; border: 0; color: var(--copper); cursor: pointer; display: inline-flex; font: 700 14px 'Plus Jakarta Sans', sans-serif; gap: 4px; }
    .flush { padding: 6px 8px; }
    .cell { display: block; }
    small.cell { font-size: 13px; }
    .avatar.has-color { color: #fff; }
    .cards { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
    .tcard { background: #fff; border: 1px solid var(--line); border-radius: 18px; overflow: hidden; text-decoration: none; transition: transform .2s, box-shadow .2s; }
    .tcard:hover { box-shadow: 0 16px 32px rgba(65,35,17,.08); transform: translateY(-2px); }
    .tcard-top { align-items: flex-start; background: linear-gradient(135deg, #2a1b12, #5a3825); display: flex; height: 84px; justify-content: space-between; padding: 14px; }
    .avatar.big { border: 3px solid #fff; height: 52px; margin-top: 30px; width: 52px; }
    .tcard-body { padding: 18px 16px 16px; }
    .tcard-body strong { display: block; font: 600 19px 'Vollkorn', serif; }
    dl { display: grid; gap: 6px; margin: 12px 0 0; }
    dl div { display: flex; font-size: 14px; justify-content: space-between; gap: 8px; }
    dt { color: var(--muted); }
    dd { font-weight: 600; margin: 0; text-align: right; }
    .pager { align-items: center; display: flex; flex-wrap: wrap; gap: 14px; justify-content: space-between; margin-top: 16px; }
    .size { align-items: center; color: var(--muted); display: flex; font-size: 14px; gap: 8px; }
    .size .input { min-height: 38px; width: auto; }
    .pages { align-items: center; display: flex; gap: 8px; }
    .pg { font-variant-numeric: tabular-nums; font-weight: 700; min-width: 56px; text-align: center; }
    @media (prefers-reduced-motion: reduce) { .tcard { transition: none; } }
  `],
})
export class PlatformAdminTenantsListComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  private router = inject(Router)

  readonly statuses: TenantStatus[] = TENANT_STATUS_ORDER
  readonly pageSizes = PAGE_SIZE_OPTIONS
  readonly initials = initials
  readonly businessTypeLabel = businessTypeLabel
  readonly countryName = countryName
  readonly relativeTime = relativeTime
  readonly shortDate = shortDate
  readonly statusLabel = statusLabel

  ngOnInit(): void {
    this.store.load()
  }

  open(id: string): void {
    this.router.navigate(['/platform-admin/negocios', id])
  }

  exportCsv(): void {
    downloadCsv(this.store.exportCsv())
  }
}
