import { Component, OnInit, computed, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { PlatformAdminStore } from './platform-admin.store'
import { TENANT_STATUS_LABELS, TenantStatus } from './platform-admin.models'
import {
  businessTypeLabel,
  hasPlatformData,
  countryName,
  downloadCsv,
  relativeTime,
  statusChipClass,
  statusDotClass,
} from './platform-admin.view-helpers'

@Component({
  selector: 'app-platform-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col w-full pb-16 space-y-space-xl">
      <!-- Operational Overview & Hero Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
        <div class="flex flex-col">
          <div class="flex items-center gap-space-xs text-pa-on-surface-variant font-label-sm uppercase tracking-widest mb-1">
            <span>Infraestructura Multi-tenant</span>
            <span>•</span>
            <span class="text-pa-primary font-semibold">{{ headerSubtitle() }}</span>
          </div>
          <div class="flex items-baseline gap-space-sm">
            <h1 class="font-headline-lg text-headline-lg text-pa-on-surface tracking-tight font-display">
              Panel de Control Global<span class="text-pa-primary">.</span>
            </h1>
            <span class="font-body-sm text-body-sm text-pa-on-surface-variant font-mono">{{ consoleVersion() }}</span>
          </div>
          <p class="font-body-md text-body-md text-pa-on-surface-variant mt-1">
            {{ headerDescription() }}
          </p>
        </div>
        <div class="flex items-center flex-wrap gap-space-xs">
          <button
            type="button"
            class="flex items-center gap-space-xs bg-pa-surface-container-lowest text-pa-on-surface hover:bg-pa-surface-container transition-all px-space-md py-2 rounded-lg font-label-md text-label-md shadow-sm"
            (click)="store.refresh()"
            [disabled]="store.loading()"
          >
            <span class="material-symbols-outlined text-[18px] text-pa-primary" [class.animate-spin]="store.loading()">cloud_sync</span>
            <span>{{ store.loading() ? 'Sincronizando...' : 'Health Check Global' }}</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-space-xs bg-pa-surface-container-lowest text-pa-on-surface hover:bg-pa-surface-container transition-all px-space-md py-2 rounded-lg font-label-md text-label-md shadow-sm"
            (click)="exportCsv()"
            [disabled]="!store.filteredTenants().length"
          >
            <span class="material-symbols-outlined text-[18px] text-pa-tertiary">download</span>
            <span>Exportar Directorio</span>
          </button>
          <button
            type="button"
            disabled
            title="Aprovisionamiento de tenants: pendiente de endpoint en la API de plataforma"
            class="flex items-center gap-space-xs bg-pa-primary text-pa-on-primary hover:bg-pa-primary-container transition-all px-space-md py-2 rounded-lg font-label-md text-label-md shadow-md opacity-40 cursor-not-allowed"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nuevo Tenant Manual</span>
          </button>
        </div>
      </div>

      @if (store.error(); as message) {
        <div class="flex items-center justify-between gap-space-md px-space-md py-space-sm rounded-lg bg-pa-error-container text-pa-on-error-container">
          <span class="flex items-center gap-space-xs font-body-sm text-body-sm">
            <span class="material-symbols-outlined text-[18px]">error</span>
            {{ message }}
          </span>
          <button class="font-label-lg text-label-lg font-semibold underline" (click)="store.clearError()">Cerrar</button>
        </div>
      }

      <!-- Primary 7 KPIs Responsive Bento Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-space-md">
        <!-- 1. Tenants Totales -->
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase tracking-wider font-semibold">Tenants Totales</span>
            <div class="w-7 h-7 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary">
              <span class="material-symbols-outlined text-[18px]">storefront</span>
            </div>
          </div>
          <div class="my-space-sm">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-pa-on-surface font-display">{{ value(store.metrics().totalTenants) }}</span>
              @if (activePercent() !== null) {
                <span class="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-pa-surface-container-high text-pa-primary font-semibold">{{ activePercent() }}% activos</span>
              }
            </div>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">{{ loadedTenants() }} registros cargados</p>
          </div>
          <div class="w-full bg-pa-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div class="bg-pa-primary h-full rounded-full transition-all" [style.width.%]="totalBarWidth()"></div>
          </div>
        </div>
        <!-- 2. Activos (Online) -->
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase tracking-wider font-semibold">Activos (Online)</span>
            <div class="w-7 h-7 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
          <div class="my-space-sm">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-pa-on-surface font-display">{{ value(store.metrics().activeTenants) }}</span>
              <span class="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-pa-surface-container-high text-pa-primary font-semibold">{{ ratioLabel() }}</span>
            </div>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">{{ syncCaption() }}</p>
          </div>
          <div class="w-full bg-pa-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div class="bg-pa-secondary h-full rounded-full transition-all" [style.width.%]="activeBarWidth()"></div>
          </div>
        </div>
        <!-- 3. En Provisioning -->
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase tracking-wider font-semibold">En Provisioning</span>
            <div class="w-7 h-7 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary-container">
              <span class="material-symbols-outlined text-[18px]">autorenew</span>
            </div>
          </div>
          <div class="my-space-sm">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-pa-on-surface font-display">{{ value(store.metrics().provisioningTenants) }}</span>
              <span class="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-pa-surface-container text-pa-on-surface-variant font-mono">Cola activa</span>
            </div>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">{{ oldestProvisioning() }}</p>
          </div>
          <div class="w-full bg-pa-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div
              class="bg-pa-primary-container h-full rounded-full transition-all"
              [class.animate-pulse]="store.metrics().provisioningTenants > 0"
              [style.width.%]="provisioningBarWidth()"
            ></div>
          </div>
        </div>
        <!-- 4. Suspendidos / Mora -->
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-pa-error uppercase tracking-wider font-semibold">En Mora / Suspend.</span>
            <div class="w-7 h-7 rounded-lg bg-pa-error-container flex items-center justify-center text-pa-error">
              <span class="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div class="my-space-sm">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-pa-error font-display">{{ value(store.metrics().suspendedTenants) }}</span>
              <span class="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-pa-error-container text-pa-on-error-container font-semibold">Acción</span>
            </div>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Acceso restringido</p>
          </div>
          <div class="w-full bg-pa-surface-container-high h-1.5 rounded-full overflow-hidden">
            <div class="bg-pa-error h-full rounded-full transition-all" [style.width.%]="suspendedBarWidth()"></div>
          </div>
        </div>
        <!-- 5. MRR Global -->
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-dashed border-pa-outline-variant">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase tracking-wider font-semibold">MRR Global</span>
            <div class="w-7 h-7 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary">
              <span class="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div class="my-space-sm">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-pa-on-surface font-display">—</span>
            </div>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Sin fuente de datos</p>
          </div>
          <div class="w-full bg-pa-surface-container-high h-1.5 rounded-full overflow-hidden"></div>
        </div>
        <!-- 6. Citas Totales (Mes) -->
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-dashed border-pa-outline-variant">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase tracking-wider font-semibold">Citas Totales (Mes)</span>
            <div class="w-7 h-7 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-tertiary">
              <span class="material-symbols-outlined text-[18px]">calendar_month</span>
            </div>
          </div>
          <div class="my-space-sm">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-pa-on-surface font-display">—</span>
            </div>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Requiere réplica por tenant</p>
          </div>
          <div class="w-full bg-pa-surface-container-high h-1.5 rounded-full overflow-hidden"></div>
        </div>
        <!-- 7. Salud DB Clúster -->
        <div class="bg-pa-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between border border-dashed border-pa-outline-variant">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase tracking-wider font-semibold">Salud Clúster DB</span>
            <div class="w-7 h-7 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary">
              <span class="material-symbols-outlined text-[18px]">dns</span>
            </div>
          </div>
          <div class="my-space-sm">
            <div class="flex items-baseline gap-2">
              <span class="font-headline-lg text-headline-lg text-pa-on-surface font-display">{{ apiHealthLabel() }}</span>
            </div>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Conexión a la API</p>
          </div>
          <div class="flex gap-1 mt-1">
            <span class="h-1.5 flex-1 rounded-full" [class.bg-pa-primary]="!store.offline()" [class.bg-pa-outline-variant]="store.offline()"></span>
            <span class="h-1.5 flex-1 rounded-full" [class.bg-pa-primary]="!store.offline()" [class.bg-pa-outline-variant]="store.offline()"></span>
            <span class="h-1.5 flex-1 rounded-full" [class.bg-pa-primary]="!store.offline()" [class.bg-pa-outline-variant]="store.offline()"></span>
          </div>
        </div>
      </div>

      <!-- Primary Middle Section: Status Distribution + Onboarding Live Pipeline -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <!-- Distribución real por estado (8 cols) -->
        <div class="lg:col-span-8 bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-md">
            <div>
              <span class="font-label-sm text-label-sm text-pa-primary uppercase tracking-wider font-semibold">Actividad en Vivo</span>
              <h2 class="font-headline-md text-headline-md text-pa-on-surface font-display">Distribución de Tenants por Estado</h2>
              <p class="font-body-sm text-body-sm text-pa-on-surface-variant">Conteos reales devueltos por <code class="font-mono text-pa-primary">GET /admin/tenants</code>.</p>
            </div>
            <span class="font-label-sm text-label-sm bg-pa-surface-container px-2 py-1 rounded text-pa-on-surface-variant font-mono">{{ totalCaption() }}</span>
          </div>
          <div class="w-full flex flex-col gap-space-md my-space-sm">
            @if (store.loading()) {
              @for (row of placeholderRows; track row) {
                <div class="flex flex-col gap-1">
                  <div class="h-3 w-24 rounded bg-pa-surface-container-high animate-pulse"></div>
                  <div class="w-full bg-pa-surface-container-high h-4 rounded-full overflow-hidden">
                    <div class="bg-pa-outline-variant h-full rounded-full" style="width: 30%"></div>
                  </div>
                </div>
              }
            } @else if (!hasData()) {
              <p class="font-body-md text-body-md text-pa-on-surface-variant py-space-md text-center">
                Sin datos de plataforma para graficar.
              </p>
            } @else {
              @for (slice of store.statusDistribution(); track slice.status) {
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between text-body-sm">
                    <span class="text-pa-on-surface font-medium">{{ slice.label }}</span>
                    <span class="font-data-tabular text-data-tabular font-semibold text-pa-on-surface">
                      {{ slice.count }}
                      <span class="text-pa-on-surface-variant font-normal">({{ percentOf(slice.ratio) }}%)</span>
                    </span>
                  </div>
                  <div class="w-full bg-pa-surface-container-high h-4 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      [class]="slice.barClass"
                      [style.width.%]="slice.ratio * 100"
                    ></div>
                  </div>
                </div>
              }
            }
          </div>
          <div class="flex items-center justify-between text-pa-on-surface-variant font-label-sm text-label-sm pt-space-xs font-mono">
            <span>{{ statusLegendLabel() }}</span>
            <span class="text-pa-primary font-semibold">{{ totalCaption() }}</span>
          </div>
        </div>
        <!-- Live Provisioning Pipeline (4 cols) -->
        <div class="lg:col-span-4 bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between pb-space-sm">
            <div class="flex flex-col">
              <div class="flex items-center gap-space-xs">
                <span
                  class="w-2 h-2 rounded-full"
                  [class.bg-pa-primary-container]="store.metrics().provisioningTenants > 0"
                  [class.animate-ping]="store.metrics().provisioningTenants > 0"
                  [class.bg-pa-outline-variant]="store.metrics().provisioningTenants === 0"
                ></span>
                <span class="font-label-sm text-label-sm text-pa-primary uppercase tracking-wider font-semibold">Cola de Provisioning</span>
              </div>
              <h3 class="font-headline-md text-headline-md text-pa-on-surface font-display">Pipeline Asíncrono</h3>
            </div>
            <span class="font-label-sm text-label-sm bg-pa-surface-container px-2 py-0.5 rounded text-pa-on-surface-variant font-mono">
              {{ store.metrics().provisioningTenants }} activos
            </span>
          </div>
          <p class="font-body-sm text-body-sm text-pa-on-surface-variant mb-space-sm">
            Tenants cuyo aprovisionamiento aún no ha finalizado, del más antiguo al más reciente.
          </p>
          <div class="space-y-space-sm flex-1">
            @if (store.loading()) {
              @for (row of [1, 2, 3]; track row) {
                <div class="p-space-sm bg-pa-surface-container-low rounded-lg flex items-center gap-space-sm">
                  <div class="w-8 h-8 rounded-lg bg-pa-surface-container animate-pulse"></div>
                  <div class="h-3 flex-1 rounded bg-pa-surface-container-high animate-pulse"></div>
                </div>
              }
            } @else if (!store.provisioningQueue().length) {
              <p class="font-body-sm text-body-sm text-pa-on-surface-variant py-space-sm">
                No hay aprovisionamientos en curso.
              </p>
            } @else {
              @for (tenant of store.provisioningQueue(); track tenant.id) {
                <div class="p-space-sm bg-pa-surface-container-low rounded-lg flex items-center justify-between">
                  <div class="flex items-center gap-space-sm min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary flex-shrink-0">
                      <span class="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="font-label-md text-label-md text-pa-on-surface font-semibold truncate">{{ tenant.tradeName }}</span>
                      <span class="font-label-sm text-label-sm text-pa-on-surface-variant font-mono truncate">{{ tenant.slug }} · {{ relativeTime(tenant.createdAt) }}</span>
                    </div>
                  </div>
                  <span class="font-label-sm text-label-sm bg-pa-secondary-container text-pa-on-secondary-container px-2 py-0.5 rounded-full font-semibold uppercase">Provisioning</span>
                </div>
              }
            }
          </div>
          <div class="pt-space-sm mt-space-xs flex items-center justify-between">
            <a
              class="font-label-sm text-label-sm text-pa-primary hover:text-pa-primary-container font-semibold flex items-center gap-1"
              routerLink="/platform-admin/tenants"
            >
              <span>Ver directorio completo</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Operational Critical Alerts: Suspended Tenants Strip -->
      <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-md">
          <div class="flex items-center gap-space-sm">
            <div class="w-10 h-10 rounded-xl bg-pa-error-container text-pa-error flex items-center justify-center shadow-sm">
              <span class="material-symbols-outlined text-[24px]">gpp_maybe</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-headline-md text-headline-md text-pa-on-surface font-display">Acción Requerida · Tenants en Mora</h2>
                <span class="font-label-sm text-label-sm bg-pa-error-container text-pa-error px-2 py-0.5 rounded-full font-bold">
                  {{ store.metrics().suspendedTenants }} Casos
                </span>
              </div>
              <p class="font-body-sm text-body-sm text-pa-on-surface-variant">Instancias con acceso suspendido por la plataforma.</p>
            </div>
          </div>
          <a
            class="bg-pa-surface-container text-pa-on-surface-variant hover:bg-pa-surface-container-high px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all self-start sm:self-auto"
            routerLink="/platform-admin/tenants"
            [queryParams]="{ status: 'suspended' }"
          >
            Ver todos los suspendidos
          </a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-space-sm">
          @if (store.loading()) {
            @for (card of [1, 2, 3, 4, 5]; track card) {
              <div class="bg-pa-surface-container-low p-space-md rounded-lg h-32 animate-pulse"></div>
            }
          } @else if (!store.suspendedTenants().length) {
            <p class="col-span-full font-body-md text-body-md text-pa-on-surface-variant py-space-md text-center">
              Ningún tenant se encuentra suspendido en este momento.
            </p>
          } @else {
            @for (tenant of suspendedPreview(); track tenant.id) {
              <div class="bg-pa-surface-container-low p-space-md rounded-lg flex flex-col justify-between hover:bg-pa-surface-container transition-colors">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-label-sm text-label-sm font-mono text-pa-error font-semibold">SUSPENDIDO</span>
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant font-mono">{{ shortId(tenant.id) }}</span>
                  </div>
                  <h4 class="font-title-md text-title-md text-pa-on-surface truncate">{{ tenant.tradeName }}</h4>
                  <span class="font-body-sm text-body-sm text-pa-on-surface-variant">{{ countryName(tenant.countryCode) }} · {{ businessTypeLabel(tenant.businessType) }}</span>
                </div>
                <div class="pt-space-sm mt-space-sm">
                  <a
                    class="block text-center bg-pa-surface-container-lowest text-pa-on-surface py-1 text-label-sm rounded hover:bg-pa-surface font-semibold shadow-xs"
                    [routerLink]="['/platform-admin/tenants', tenant.id]"
                  >
                    Ver ficha
                  </a>
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Bottom Section: Tenants recientes & Distribución geográfica -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <!-- Tenants recientes (8 cols) -->
        <div class="lg:col-span-8 bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-md">
            <div>
              <span class="font-label-sm text-label-sm text-pa-primary uppercase tracking-wider font-semibold">Altas Recientes</span>
              <h3 class="font-headline-md text-headline-md text-pa-on-surface font-display">Studios con Mayor Rendimiento</h3>
              <p class="font-body-sm text-body-sm text-pa-on-surface-variant">Tenants más recientes por fecha de registro en la plataforma.</p>
            </div>
            <a class="font-label-md text-label-md text-pa-primary font-semibold hover:text-pa-primary-container" routerLink="/platform-admin/tenants">Explorar directorio →</a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-pa-surface-container-low text-pa-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                  <th class="py-2.5 px-space-md rounded-l-lg">Estudio</th>
                  <th class="py-2.5 px-space-md">Ubicación</th>
                  <th class="py-2.5 px-space-md">Tipo</th>
                  <th class="py-2.5 px-space-md">Estado</th>
                  <th class="py-2.5 px-space-md text-right rounded-r-lg">Alta</th>
                </tr>
              </thead>
              <tbody class="divide-y-0 text-pa-on-surface font-body-md text-body-md">
                @if (store.loading()) {
                  @for (row of [1, 2, 3]; track row) {
                    <tr>
                      <td class="py-3 px-space-md" colspan="5">
                        <div class="h-4 rounded bg-pa-surface-container-high animate-pulse"></div>
                      </td>
                    </tr>
                  }
                } @else if (!store.recentTenants().length) {
                  <tr>
                    <td class="py-3 px-space-md text-pa-on-surface-variant" colspan="5">Sin tenants registrados.</td>
                  </tr>
                } @else {
                  @for (tenant of store.recentTenants(); track tenant.id; let index = $index) {
                    <tr class="hover:bg-pa-surface-container-low/60 transition-colors">
                      <td class="py-3 px-space-md">
                        <div class="flex items-center gap-space-sm">
                          <span
                            class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-label-sm"
                            [class.bg-pa-primary]="index === 0"
                            [class.text-pa-on-primary]="index === 0"
                            [class.bg-pa-secondary]="index === 1"
                            [class.bg-pa-tertiary]="index > 1"
                            [class.text-pa-on-tertiary]="index > 1"
                          >{{ index + 1 }}</span>
                          <div class="flex flex-col">
                            <span class="font-title-md text-title-md text-pa-on-surface font-semibold">{{ tenant.tradeName }}</span>
                            <span class="font-body-sm text-body-sm text-pa-on-surface-variant font-mono">{{ tenant.slug }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-space-md">
                        <span class="font-body-sm text-body-sm text-pa-on-surface">{{ countryName(tenant.countryCode) }}</span>
                      </td>
                      <td class="py-3 px-space-md">
                        <span class="font-body-sm text-body-sm text-pa-on-surface-variant">{{ businessTypeLabel(tenant.businessType) }}</span>
                      </td>
                      <td class="py-3 px-space-md">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold" [class]="statusChipClass(tenant.status)">
                          <span class="w-2 h-2 rounded-full" [class]="statusDotClass(tenant.status)"></span>
                          {{ statusLabel(tenant.status) }}
                        </span>
                      </td>
                      <td class="py-3 px-space-md text-right font-data-tabular text-data-tabular text-pa-on-surface-variant">
                        {{ tenant.createdAt | date: 'dd MMM yyyy' }}
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
          <div class="pt-space-md flex items-center justify-between">
            <span class="font-body-sm text-body-sm text-pa-on-surface-variant">{{ loadedTenants() }} studios federados en la página actual.</span>
            <a class="font-label-md text-label-md text-pa-primary font-semibold hover:text-pa-primary-container" routerLink="/platform-admin/tenants">Ver todos →</a>
          </div>
        </div>
        <!-- Distribución geográfica (4 cols) -->
        <div class="lg:col-span-4 bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-space-xs">
              <span class="font-label-sm text-label-sm text-pa-primary uppercase tracking-wider font-semibold">Cobertura Geográfica</span>
              <span class="w-2 h-2 rounded-full" [class.bg-pa-primary]="!store.offline()" [class.bg-pa-outline-variant]="store.offline()"></span>
            </div>
            <h3 class="font-headline-md text-headline-md text-pa-on-surface font-display">Tenants por País</h3>
            <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Distribución de los tenants cargados desde la plataforma.</p>
            <div class="mt-space-md space-y-space-sm">
              @if (store.loading()) {
                @for (row of [1, 2, 3]; track row) {
                  <div class="p-space-sm bg-pa-surface-container-low rounded-lg h-14 animate-pulse"></div>
                }
              } @else if (!store.countryDistribution().length) {
                <p class="font-body-sm text-body-sm text-pa-on-surface-variant py-space-sm">Sin datos de ubicación.</p>
              } @else {
                @for (slice of store.countryDistribution(); track slice.code) {
                  <div class="p-space-sm bg-pa-surface-container-low rounded-lg flex items-center justify-between">
                    <div class="flex items-center gap-space-sm">
                      <span class="material-symbols-outlined text-pa-primary text-[20px]">public</span>
                      <div>
                        <span class="font-label-md text-label-md text-pa-on-surface font-semibold block">{{ countryName(slice.code) }}</span>
                        <span class="font-body-sm text-body-sm text-pa-on-surface-variant font-mono">{{ slice.code }}</span>
                      </div>
                    </div>
                    <span class="font-data-tabular text-data-tabular text-pa-on-surface font-semibold">{{ slice.count }}</span>
                  </div>
                }
              }
            </div>
          </div>
          <div class="pt-space-md mt-space-sm bg-pa-surface-container-low p-space-sm rounded-lg flex items-center justify-between">
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase font-semibold">Países con tenants</span>
              <span class="font-data-tabular text-data-tabular font-bold text-pa-on-surface">{{ store.countryDistribution().length }}</span>
            </div>
            <div class="flex flex-col text-right">
              <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase font-semibold">Última sincronización</span>
              <span class="font-data-tabular text-data-tabular font-semibold text-pa-primary">{{ syncLabel() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PlatformAdminDashboardComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)

  readonly placeholderRows = [1, 2, 3, 4, 5]

  ngOnInit(): void {
    this.store.load()
  }

  loadedTenants(): number {
    return this.store.tenants().length
  }

  hasData(): boolean {
    return this.store.totalTenants() !== null && this.store.totalTenants()! > 0
  }

  value(count: number): string | number {
    return !hasPlatformData(this.store) ? '—' : count
  }

  percentOf(ratio: number): string {
    return (ratio * 100).toFixed(1)
  }

  activePercent(): string | null {
    const metrics = this.store.metrics()
    if (metrics.isEmpty) return null
    return (metrics.activeRatio * 100).toFixed(1)
  }

  ratioLabel(): string {
    const percent = this.activePercent()
    return percent === null ? '—' : `${percent}%`
  }

  totalBarWidth(): number {
    const metrics = this.store.metrics()
    if (metrics.isEmpty) return 0
    return Math.min(100, (this.store.tenants().length / metrics.totalTenants) * 100)
  }

  activeBarWidth(): number {
    return (this.store.metrics().activeRatio || 0) * 100
  }

  provisioningBarWidth(): number {
    const metrics = this.store.metrics()
    if (metrics.isEmpty) return 0
    return (metrics.provisioningTenants / metrics.totalTenants) * 100
  }

  suspendedBarWidth(): number {
    const metrics = this.store.metrics()
    if (metrics.isEmpty) return 0
    return (metrics.suspendedTenants / metrics.totalTenants) * 100
  }

  apiHealthLabel(): string {
    if (!hasPlatformData(this.store)) return '—'
    return this.store.offline() ? 'Offline' : 'OK'
  }

  totalCaption(): string {
    if (this.store.loading()) return 'cargando...'
    if (this.store.offline()) return 'sin datos'
    return `${this.store.metrics().totalTenants} tenants`
  }

  statusLegendLabel(): string {
    return 'Conteos del servidor'
  }

  headerSubtitle(): string {
    if (this.store.offline()) return 'API no disponible'
    const countries = this.store.countryDistribution().length
    return countries > 0 ? `${countries} países en red` : 'Red multi-tenant'
  }

  headerDescription(): string {
    if (this.store.offline()) {
      return 'No hay conexión con la API de plataforma, por lo que no se muestran métricas.'
    }
    return `Monitoreo en tiempo real de ${this.store.metrics().totalTenants} estudios barberiles registrados en la plataforma.`
  }

  consoleVersion(): string {
    const syncedAt = this.store.lastSyncedAt()
    return syncedAt ? `Sync ${syncedAt.toLocaleTimeString()}` : 'Consola Ops'
  }

  syncCaption(): string {
    const syncedAt = this.store.lastSyncedAt()
    if (!syncedAt) return this.store.offline() ? 'Datos no disponibles' : 'Sin sincronizar'
    return `Actualizado ${syncedAt.toLocaleTimeString()}`
  }

  syncLabel(): string {
    const syncedAt = this.store.lastSyncedAt()
    if (!syncedAt) return this.store.offline() ? 'sin datos' : 'pendiente'
    return syncedAt.toLocaleTimeString()
  }

  oldestProvisioning(): string {
    const queue = this.store.provisioningQueue()
    if (queue.length === 0) return 'Cola vacía'
    return `Más antiguo: ${relativeTime(queue[0].createdAt)}`
  }

  relativeTime = relativeTime
  countryName = countryName
  businessTypeLabel = businessTypeLabel
  statusChipClass = statusChipClass
  statusDotClass = statusDotClass

  suspendedPreview() {
    return this.store.suspendedTenants().slice(0, 5)
  }

  shortId(id: string): string {
    return id.slice(0, 8)
  }

  statusLabel(status: TenantStatus): string {
    return TENANT_STATUS_LABELS[status]
  }

  exportCsv(): void {
    downloadCsv(this.store.exportCsv())
  }
}
