import { Component, OnInit, computed, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { PlatformAdminStore } from './platform-admin.store'
import {
  BUSINESS_TYPE_LABELS,
  PAGE_SIZE_OPTIONS,
  TENANT_STATUS_LABELS,
  TENANT_STATUS_ORDER,
  TenantStatus,
} from './platform-admin.models'
import {
  businessTypeLabel,
  hasPlatformData,
  countryName,
  downloadCsv,
  initials,
  relativeTime,
  statusChipClass,
  statusDotClass,
} from './platform-admin.view-helpers'

@Component({
  selector: 'app-platform-admin-tenants-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="flex flex-col w-full pb-16 space-y-space-md">
      <!-- Top Breadcrumb & Quick Platform Counters -->
      <div class="flex flex-wrap items-center justify-between gap-space-md py-space-md">
        <div class="flex items-center gap-space-xs text-pa-on-surface-variant font-label-md text-label-md">
          <a routerLink="/platform-admin" class="hover:text-pa-on-surface cursor-pointer transition-colors">Plataforma</a>
          <span class="text-pa-outline">/</span>
          <span class="text-pa-on-surface font-semibold">Negocios Registrados</span>
          <span class="text-pa-outline">/</span>
          <span class="bg-pa-surface-container-high px-space-xs py-0.5 rounded text-pa-primary font-mono text-label-sm font-semibold">
            {{ totalBadge() }} Instancias
          </span>
        </div>
        <div class="flex items-center gap-space-md">
          <div class="flex items-center gap-space-xs bg-pa-surface-container-low px-space-sm py-1 rounded-full shadow-sm">
            <span class="material-symbols-outlined text-[16px] text-pa-primary">domain</span>
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant font-medium">Fuente:</span>
            <span class="font-label-sm text-label-sm text-pa-on-surface font-semibold font-mono">/admin/negocios</span>
          </div>
          <div class="flex items-center gap-space-xs bg-pa-surface-container-low px-space-sm py-1 rounded-full shadow-sm">
            <span
              class="w-2 h-2 rounded-full"
              [class.bg-pa-primary]="!store.offline()"
              [class.animate-ping]="!store.offline()"
              [class.bg-pa-error]="store.offline()"
            ></span>
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant">
              Estado API:
              <strong class="text-pa-on-surface">{{ apiStatusLabel() }}</strong>
            </span>
          </div>
        </div>
      </div>

      @if (store.error(); as message) {
        <div class="flex items-center justify-between gap-space-md px-space-md py-space-sm rounded-lg bg-pa-error-container text-pa-on-error-container">
          <span class="flex items-center gap-space-xs font-body-sm text-body-sm">
            <span class="material-symbols-outlined text-[18px]">error</span>
            {{ message }}
          </span>
          <div class="flex items-center gap-space-sm">
            <button class="font-label-lg text-label-lg font-semibold underline" (click)="store.refresh()">Reintentar</button>
            <button class="font-label-lg text-label-lg font-semibold underline" (click)="store.clearError()">Cerrar</button>
          </div>
        </div>
      }

      <!-- Header Banner -->
      <div class="relative bg-pa-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-lg overflow-hidden">
        <div class="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-pa-secondary-container/20 blur-3xl pointer-events-none"></div>
        <div class="flex flex-col gap-space-xs relative z-10 max-w-2xl">
          <div class="flex items-center gap-space-xs">
            <span class="material-symbols-outlined text-pa-primary text-[22px]">domain</span>
            <span class="font-label-sm text-label-sm tracking-wider uppercase font-semibold text-pa-primary">Catálogo Multi-Tenant Central</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-pa-on-surface font-semibold tracking-tight">Directorio Global de Negocios</h1>
          <p class="font-body-md text-body-md text-pa-on-surface-variant">Gestión de negocios registrados aislados en la plataforma SaaS.</p>
        </div>
        <div class="flex flex-wrap items-center gap-space-sm relative z-10">
          <button
            type="button"
            class="flex items-center gap-space-xs bg-pa-surface-container hover:bg-pa-surface-container-high text-pa-on-surface px-space-md py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm"
            (click)="exportCsv()"
            [disabled]="!store.filteredTenants().length"
          >
            <span class="material-symbols-outlined text-[18px]">file_download</span>
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            (click)="store.refresh()"
            [disabled]="store.loading()"
            class="flex items-center gap-space-xs bg-pa-surface-container hover:bg-pa-surface-container-high text-pa-on-surface px-space-md py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="store.loading()">cached</span>
            <span>{{ store.loading() ? 'Sincronizando...' : 'Sincronizar' }}</span>
          </button>
          <button
            type="button"
            disabled
            title="Aprovisionamiento de tenants: pendiente de endpoint en la API de plataforma"
            class="flex items-center gap-space-xs bg-pa-primary hover:bg-pa-primary-container text-pa-on-primary px-space-md py-2 rounded-lg font-label-md text-label-md transition-all shadow-sm opacity-40 cursor-not-allowed"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Aprovisionar Tenant</span>
          </button>
        </div>
      </div>

      <!-- Key Metrics Ribbon (all derived from countsByStatus) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-md">
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-pa-on-surface-variant">Negocios Totales</span>
            <span class="p-1.5 rounded-lg bg-pa-surface-container text-pa-on-surface-variant flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">storefront</span>
            </span>
          </div>
          <div class="flex items-baseline justify-between mt-space-sm">
            <span class="font-headline-lg text-headline-lg font-semibold text-pa-on-surface">{{ value(store.negocios().length) }}</span>
            <span class="inline-flex items-center font-label-sm text-label-sm text-pa-primary font-semibold bg-pa-primary-fixed/50 px-2 py-0.5 rounded-full">
              {{ loadedLabel() }}
            </span>
          </div>
          <span class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">{{ store.metrics().activeNegocios }} activos en producción</span>
        </div>
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-pa-on-surface-variant">Ratio de Actividad</span>
            <span class="p-1.5 rounded-lg bg-pa-surface-container text-pa-on-surface-variant flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
            </span>
          </div>
          <div class="flex items-baseline justify-between mt-space-sm">
            <span class="font-headline-lg text-headline-lg font-semibold text-pa-on-surface">{{ activeRatioLabel() }}</span>
<span class="inline-flex items-center font-label-sm text-label-sm text-pa-on-surface-variant font-semibold bg-pa-surface-container px-2 py-0.5 rounded-full">
               {{ store.metrics().suspendedTenants }} negocios en riesgo
             </span>
          </div>
          <div class="w-full bg-pa-surface-container-high h-1.5 rounded-full overflow-hidden mt-space-sm">
            <div class="bg-pa-primary h-full rounded-full transition-all" [style.width.%]="activeRatioWidth()"></div>
          </div>
        </div>
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-pa-on-surface-variant">En Provisioning</span>
            <span class="p-1.5 rounded-lg bg-pa-surface-container text-pa-on-surface-variant flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">autorenew</span>
            </span>
          </div>
          <div class="flex items-baseline justify-between mt-space-sm">
<span class="font-headline-lg text-headline-lg font-semibold text-pa-on-surface">{{ value(store.metrics().provisioningNegocios) }}</span>
              <span class="inline-flex items-center font-label-sm text-label-sm text-pa-primary font-semibold bg-pa-primary-fixed/50 px-2 py-0.5 rounded-full">
                {{ value(store.metrics().deletingTenants) }} en purga
            </span>
          </div>
          <span class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Instancias en transición</span>
        </div>
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-pa-on-surface-variant">Países Cubiertos</span>
            <span class="p-1.5 rounded-lg bg-pa-surface-container text-pa-on-surface-variant flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">public</span>
            </span>
          </div>
          <div class="flex items-baseline justify-between mt-space-sm">
            <span class="font-headline-lg text-headline-lg font-semibold text-pa-on-surface">{{ value(store.countryDistribution().length) }}</span>
            <span class="inline-flex items-center font-label-sm text-label-sm text-pa-on-surface-variant font-semibold bg-pa-surface-container px-2 py-0.5 rounded-full">
              {{ store.statusDistribution().length }} estados
            </span>
          </div>
          <span class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">{{ leadingCountryLabel() }}</span>
        </div>
      </div>

      <!-- Search, Filter Chips & Facet Dropdowns -->
      <div class="mt-space-lg bg-pa-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div class="relative flex-1 max-w-xl">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-pa-on-surface-variant text-[20px]">search</span>
            <input
              class="w-full pl-10 pr-24 py-2 bg-pa-surface-container-low rounded-lg text-pa-on-surface font-body-md text-body-md placeholder:text-pa-outline focus:outline-none focus:bg-pa-surface-container-lowest focus:shadow-sm transition-all"
              placeholder="Filtrar por Trade Name, Legal Name o slug (ej. 'valhalla')..."
              type="text"
              [ngModel]="store.filters().search"
              (ngModelChange)="store.setSearch($event)"
            />
            @if (store.filters().search) {
              <button
                type="button"
                (click)="store.setSearch('')"
                class="absolute right-2.5 top-2 font-label-sm text-label-sm text-pa-outline hover:text-pa-on-surface"
              >
                Limpiar
              </button>
            } @else {
              <div class="absolute right-2.5 top-2 flex items-center gap-1">
                <span class="font-label-sm text-label-sm bg-pa-surface-container-high text-pa-on-surface-variant px-1.5 py-0.5 rounded font-mono">/</span>
              </div>
            }
          </div>
          <div class="flex flex-wrap items-center gap-space-sm">
            <div class="relative inline-flex items-center">
              <select
                class="appearance-none bg-pa-surface-container-low hover:bg-pa-surface-container text-pa-on-surface font-label-md text-label-md pl-3 pr-8 py-2 rounded-lg cursor-pointer focus:outline-none focus:bg-pa-surface-container-lowest transition-all"
                [ngModel]="store.filters().country"
                (ngModelChange)="store.setCountryFilter($event)"
              >
                <option [ngValue]="null">Todos los países</option>
                @for (code of store.countryOptions(); track code) {
                  <option [ngValue]="code">{{ countryName(code) }} ({{ code }})</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-2 text-pa-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
            </div>
            <div class="flex items-center bg-pa-surface-container-low p-1 rounded-lg">
              <button
                type="button"
                (click)="store.setViewMode('table')"
                title="Vista de Tabla"
                class="p-1 rounded flex items-center justify-center"
                [class.bg-pa-surface-container-lowest]="store.viewMode() === 'table'"
                [class.text-pa-primary]="store.viewMode() === 'table'"
                [class.shadow-sm]="store.viewMode() === 'table'"
                [class.text-pa-on-surface-variant]="store.viewMode() !== 'table'"
              >
                <span class="material-symbols-outlined text-[18px]">table_rows</span>
              </button>
              <button
                type="button"
                (click)="store.setViewMode('grid')"
                title="Vista de Mosaico"
                class="p-1 rounded flex items-center justify-center"
                [class.bg-pa-surface-container-lowest]="store.viewMode() === 'grid'"
                [class.text-pa-primary]="store.viewMode() === 'grid'"
                [class.shadow-sm]="store.viewMode() === 'grid'"
                [class.text-pa-on-surface-variant]="store.viewMode() !== 'grid'"
              >
                <span class="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>
        <!-- Filter Status Chips Bar -->
        <div class="flex items-center gap-space-xs overflow-x-auto pb-1 text-nowrap">
          <button
            type="button"
            (click)="store.setStatusFilter(null)"
            class="px-space-md py-1.5 rounded-full font-label-sm text-label-sm font-semibold transition-all flex items-center gap-1.5"
            [class.bg-pa-primary-container]="store.statusFilter() === null"
            [class.text-pa-on-primary-container]="store.statusFilter() === null"
            [class.shadow-sm]="store.statusFilter() === null"
            [class.bg-pa-surface-container]="store.statusFilter() !== null"
            [class.text-pa-on-surface-variant]="store.statusFilter() !== null"
          >
            <span>Todos</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px]" [class.bg-pa-surface-container-lowest]="store.statusFilter() === null" [class.bg-pa-surface-container-high]="store.statusFilter() !== null">
              {{ countOf(null) }}
            </span>
          </button>
          @for (status of statusOrder; track status) {
            <button
              type="button"
              (click)="store.setStatusFilter(status)"
              class="px-space-md py-1.5 rounded-full font-label-sm text-label-sm transition-all flex items-center gap-1.5"
              [class.bg-pa-primary-container]="store.statusFilter() === status"
              [class.text-pa-on-primary-container]="store.statusFilter() === status"
              [class.shadow-sm]="store.statusFilter() === status"
              [class.font-semibold]="store.statusFilter() === status"
              [class.bg-pa-surface-container]="store.statusFilter() !== status"
              [class.text-pa-on-surface-variant]="store.statusFilter() !== status"
            >
              <span class="w-2 h-2 rounded-full" [class]="statusDotClass(status)"></span>
              <span>{{ statusLabels[status] }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px]"
                [class.bg-pa-surface-container-lowest]="store.statusFilter() === status"
                [class.bg-pa-surface-container-high]="store.statusFilter() !== status"
              >{{ countOf(status) }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Operational Multi-Tenant Table Container -->
      <div class="mt-space-md bg-pa-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div class="px-space-lg py-space-sm bg-pa-surface-container-low flex items-center justify-between text-pa-on-surface-variant font-label-sm text-label-sm">
          <div class="flex items-center gap-space-sm">
            <span>
              Mostrando <strong>{{ store.pagination().from }}–{{ store.pagination().to }}</strong> de
              <strong>{{ store.pagination().total }}</strong> negocios
            </span>
            @if (store.hasActiveFilters()) {
              <span class="text-pa-outline">·</span>
              <span class="text-pa-primary font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">tune</span>
                Filtros aplicados
              </span>
              <button type="button" (click)="store.clearFilters()" class="underline hover:text-pa-primary-container">Limpiar</button>
            }
          </div>
          <div class="flex items-center gap-space-md">
            <span>Orden: registro descendente</span>
          </div>
        </div>

        @if (store.loading()) {
          <div class="p-space-lg flex flex-col gap-space-sm">
            @for (row of [1, 2, 3, 4, 5, 6]; track row) {
              <div class="h-12 rounded bg-pa-surface-container animate-pulse"></div>
            }
          </div>
        } @else if (!store.filteredTenants().length) {
          <div class="p-space-xl flex flex-col items-center gap-space-sm text-center">
            <span class="material-symbols-outlined text-[40px] text-pa-outline">search_off</span>
<p class="font-headline-sm text-headline-sm text-pa-on-surface">Sin resultados</p>
                  <p class="font-body-sm text-body-sm text-pa-on-surface-variant">
                    @if (store.offline()) {
                      No se pudo consultar la API de plataforma.
                    } @else if (store.hasActiveFilters()) {
                      Ningún negocio coincide con los filtros aplicados.
                    } @else {
                      Todavía no hay negocios registrados en la plataforma.
                    }
            </p>
            @if (store.hasActiveFilters()) {
              <button
                type="button"
                (click)="store.clearFilters()"
                class="mt-space-xs bg-pa-surface-container hover:bg-pa-surface-container-high text-pa-on-surface px-space-md py-2 rounded-lg font-label-md text-label-md"
              >
                Limpiar filtros
              </button>
            }
          </div>
        } @else if (store.viewMode() === 'grid') {
          <div class="p-space-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
            @for (tenant of store.pagedTenants(); track tenant.id) {
              <div class="p-space-md bg-pa-surface-container-low rounded-xl flex flex-col gap-space-sm hover:bg-pa-surface-container transition-colors">
                <div class="flex items-center gap-space-sm">
                  <div
                    class="w-9 h-9 rounded-lg bg-pa-surface-container flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm font-bold text-pa-primary font-mono text-[11px]"
                  >
                    @if (tenant.branding?.logoUrl) {
                      <img class="w-full h-full object-cover" [src]="tenant.branding?.logoUrl" [alt]="tenant.tradeName" />
                    } @else {
                      {{ initials(tenant.tradeName) }}
                    }
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="font-title-md text-title-md text-pa-on-surface font-semibold truncate">{{ tenant.tradeName }}</span>
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant font-mono truncate">{{ tenant.slug }}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" [class]="statusChipClass(tenant.status)">
                    <span class="w-2 h-2 rounded-full" [class]="statusDotClass(tenant.status)"></span>
                    {{ statusLabels[tenant.status] }}
                  </span>
                  <span class="font-label-sm text-label-sm text-pa-on-surface-variant">{{ countryName(tenant.countryCode) }}</span>
                </div>
                <a
                  class="text-center bg-pa-surface-container-lowest text-pa-on-surface py-1.5 rounded-lg text-label-sm font-semibold hover:bg-pa-primary hover:text-pa-on-primary transition-colors"
                  [routerLink]="['/platform-admin/tenants', tenant.id]"
                >
                  Ver ficha
                </a>
              </div>
            }
          </div>
        } @else {
          <div class="w-full overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-pa-surface-container font-label-sm text-label-sm text-pa-on-surface-variant uppercase tracking-wider select-none">
                  <th class="py-3 px-space-md">Negocio</th>
                  <th class="py-3 px-space-md">Dueño</th>
                  <th class="py-3 px-space-md">Razón Social</th>
                  <th class="py-3 px-space-md">Tipo</th>
                  <th class="py-3 px-space-md">Estado</th>
                  <th class="py-3 px-space-md">País</th>
                  <th class="py-3 px-space-md">Teléfono</th>
                  <th class="py-3 px-space-md">Registro</th>
                  <th class="py-3 px-space-md text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-pa-surface-container font-body-sm text-body-sm text-pa-on-surface">
                @for (tenant of store.pagedTenants(); track tenant.id) {
                  <tr
                    class="hover:bg-pa-surface-container-low/70 transition-colors"
                    [class.bg-pa-surface-container]="tenant.status === 'provisioning'"
                    [class.opacity-60]="tenant.status === 'deleted' || tenant.status === 'deleting'"
                  >
                    <td class="py-3 px-space-md">
                      <div class="flex items-center gap-space-sm min-w-[220px]">
                        <div class="w-9 h-9 rounded-lg bg-pa-surface-container flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm font-bold text-pa-primary font-mono text-[11px]">
                          @if (tenant.branding?.logoUrl) {
                            <img class="w-full h-full object-cover" [src]="tenant.branding?.logoUrl" [alt]="tenant.tradeName" />
                          } @else {
                            {{ initials(tenant.tradeName) }}
                          }
                        </div>
                        <div class="flex flex-col min-w-0">
                          <span
                            class="font-title-md text-title-md text-pa-on-surface font-semibold truncate"
                            [class.line-through]="tenant.status === 'deleted' || tenant.status === 'deleting'"
                            [class.text-pa-on-surface-variant]="tenant.status === 'suspended'"
                          >
                            {{ tenant.tradeName }}
                          </span>
                          <div class="flex items-center gap-1.5 text-pa-on-surface-variant font-label-sm text-label-sm">
                            <span class="bg-pa-surface-container px-1 py-0.2 rounded text-pa-primary font-mono text-[10px]">{{ tenant.slug }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 px-space-md">
                      <div *ngIf="tenant.owner; else noOwner" class="flex flex-col">
                        <span class="font-label-md text-label-md text-pa-on-surface font-medium truncate">{{ tenant.owner.name }}</span>
                        <span class="font-body-sm text-body-sm text-pa-on-surface-variant font-mono truncate">{{ tenant.owner.email }}</span>
                      </div>
                      <ng-template #noOwner><span class="font-body-sm text-body-sm text-pa-on-surface-variant">—</span></ng-template>
                    </td>
                    <td class="py-3 px-space-md">
                      <div class="flex flex-col min-w-[170px]">
                        <span class="font-label-md text-label-md text-pa-on-surface font-medium truncate">{{ tenant.legalName }}</span>
                        <span class="font-body-sm text-body-sm text-pa-on-surface-variant font-mono truncate">{{ shortId(tenant.id) }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-space-md">
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold bg-pa-surface-container text-pa-on-surface">
                        {{ businessLabels[tenant.businessType] }}
                      </span>
                    </td>
                    <td class="py-3 px-space-md">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" [class]="statusChipClass(tenant.status)">
                        <span class="w-2 h-2 rounded-full" [class]="statusDotClass(tenant.status)"></span>
                        {{ statusLabels[tenant.status] }}
                      </span>
                    </td>
                    <td class="py-3 px-space-md">
                      <span class="font-body-sm text-body-sm text-pa-on-surface">{{ countryName(tenant.countryCode) }}</span>
                    </td>
                    <td class="py-3 px-space-md">
                      <span class="font-body-sm text-body-sm text-pa-on-surface-variant">{{ tenant.phone || '—' }}</span>
                    </td>
                    <td class="py-3 px-space-md">
                      <div class="flex flex-col">
                        <span class="font-label-sm text-label-sm text-pa-on-surface font-medium">{{ relativeTime(tenant.createdAt) }}</span>
                        <span class="font-body-sm text-body-sm text-pa-on-surface-variant text-[11px]">{{ tenant.createdAt | date: 'dd MMM yyyy' }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-space-md text-right">
                      <div class="flex items-center justify-end gap-1">
                        <a
                          class="p-1.5 rounded-lg text-pa-primary hover:bg-pa-primary/10 transition-colors"
                          title="Ver ficha del tenant"
                          [routerLink]="['/platform-admin/tenants', tenant.id]"
                        >
                          <span class="material-symbols-outlined text-[18px]">visibility</span>
                        </a>
                        <button
                          type="button"
                          disabled
                          title="Suspensión / reactivación: pendiente de endpoint en la API de plataforma"
                          class="p-1.5 rounded-lg text-pa-on-surface-variant opacity-40 cursor-not-allowed"
                        >
                          <span class="material-symbols-outlined text-[18px]">block</span>
                        </button>
                        <button
                          type="button"
                          disabled
                          title="Impersonación: pendiente de endpoint en la API de plataforma"
                          class="p-1.5 rounded-lg text-pa-on-surface-variant opacity-40 cursor-not-allowed"
                        >
                          <span class="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Pagination Footer -->
        <div class="px-space-lg py-space-md bg-pa-surface-container-lowest flex flex-wrap items-center justify-between gap-space-md text-pa-on-surface-variant font-label-md text-label-md">
          <div class="flex items-center gap-space-sm">
            <span class="font-body-sm text-body-sm">Filas por página:</span>
            <select
              class="bg-pa-surface-container-low text-pa-on-surface font-label-sm text-label-sm px-2 py-1 rounded cursor-pointer focus:outline-none"
              [ngModel]="store.pageSize()"
              (ngModelChange)="store.setPageSize($event)"
            >
              @for (size of pageSizes; track size) {
                <option [ngValue]="size">{{ size }}</option>
              }
            </select>
            <span class="text-pa-outline">·</span>
            <span class="font-body-sm text-body-sm">
              Página {{ store.pagination().page }} de {{ store.pagination().totalPages }}
            </span>
          </div>
          <div class="flex items-center gap-space-xs">
            <button
              type="button"
              (click)="store.setPage(store.pagination().page - 1)"
              [disabled]="store.pagination().page === 1"
              class="px-space-md py-1.5 rounded-lg bg-pa-surface-container-low text-pa-on-surface font-label-sm text-label-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pa-surface-container-high transition-colors"
            >
              <span class="material-symbols-outlined text-[16px]">chevron_left</span> Anterior
            </button>
            @for (page of visiblePages(); track page) {
              @if (page === null) {
                <span class="px-1 text-pa-outline">...</span>
              } @else {
                <button
                  type="button"
                  (click)="store.setPage(page)"
                  class="w-8 h-8 rounded-lg font-label-sm text-label-sm font-semibold flex items-center justify-center transition-colors"
                  [class.bg-pa-primary]="page === store.pagination().page"
                  [class.text-pa-on-primary]="page === store.pagination().page"
                  [class.shadow-sm]="page === store.pagination().page"
                  [class.hover:bg-pa-surface-container]="page !== store.pagination().page"
                  [class.text-pa-on-surface]="page !== store.pagination().page"
                >
                  {{ page }}
                </button>
              }
            }
            <button
              type="button"
              (click)="store.setPage(store.pagination().page + 1)"
              [disabled]="store.pagination().page === store.pagination().totalPages"
              class="px-space-md py-1.5 rounded-lg bg-pa-surface-container hover:bg-pa-surface-container-high text-pa-on-surface font-label-sm text-label-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <span class="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlatformAdminTenantsListComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  private route = inject(ActivatedRoute)

  readonly statusOrder = TENANT_STATUS_ORDER
  readonly statusLabels = TENANT_STATUS_LABELS
  readonly businessLabels = BUSINESS_TYPE_LABELS
  readonly pageSizes = PAGE_SIZE_OPTIONS

  readonly totalBadge = computed(() => {
    const total = this.store.totalTenants()
    return total === null ? '—' : total
  })

  readonly apiStatusLabel = computed(() => {
    if (this.store.loading()) return 'Consultando'
    return this.store.offline() ? 'No disponible' : 'Conectada'
  })

  readonly activeRatioLabel = computed(() => {
    const metrics = this.store.metrics()
    if (metrics.isEmpty) return '—'
    return `${(metrics.activeRatio * 100).toFixed(1)}%`
  })

  ngOnInit(): void {
    // Deep links such as ?status=suspended (from the dashboard) pre-select a chip.
    const status = this.route.snapshot.queryParamMap.get('status')
    if (status && status in TENANT_STATUS_LABELS) {
      this.store.setStatusFilter(status as TenantStatus)
    }
    this.store.load()
  }

  value(count: number): string | number {
    return !hasPlatformData(this.store) ? '—' : count
  }

  loadedLabel(): string {
    return `${this.store.tenants().length} en página`
  }

  activeRatioWidth(): number {
    return (this.store.metrics().activeRatio || 0) * 100
  }

  leadingCountryLabel(): string {
    const leader = this.store.countryDistribution()[0]
    return leader ? `Mayor presencia: ${countryName(leader.code)}` : 'Sin datos de ubicación'
  }

  countOf(status: TenantStatus | null): string | number {
    if (!hasPlatformData(this.store)) return '—'
    if (status === null) return this.store.totalTenants() ?? this.store.tenants().length
    return this.store.countsByStatus()[status] ?? 0
  }

  shortId(id: string): string {
    return id.slice(0, 8)
  }

  initials = initials
  relativeTime = relativeTime
  statusChipClass = statusChipClass
  statusDotClass = statusDotClass
  countryName = countryName
  businessTypeLabel = businessTypeLabel

  visiblePages(): Array<number | null> {
    const { page, totalPages } = this.store.pagination()
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: Array<number | null> = [1]
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    if (start > 2) pages.push(null)
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push(null)
    pages.push(totalPages)
    return pages
  }

  exportCsv(): void {
    downloadCsv(this.store.exportCsv())
  }
}
