import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { toSignal } from '@angular/core/rxjs-interop'
import { map } from 'rxjs'
import { PlatformAdminStore, tenantAgeInDays } from './platform-admin.store'
import { PlatformTenant, TENANT_STATUS_LABELS, TenantStatus } from './platform-admin.models'
import {
  businessTypeLabel,
  countryName,
  initials,
  relativeTime,
  statusChipClass,
  statusDotClass,
} from './platform-admin.view-helpers'

interface DetailTab {
  key: string;
  label: string;
  icon: string;
  /** Tabs whose data the platform API does not expose yet. */
  pending: boolean;
}

@Component({
  selector: 'app-platform-admin-tenant-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col w-full pb-16 space-y-space-lg">
      @if (currentTenant(); as tenant) {
        <!-- Tenant 360 Header Area -->
        <section class="flex flex-col gap-space-sm">
          <div class="flex flex-wrap items-center justify-between gap-space-sm">
            <div class="flex items-center gap-space-xs text-pa-on-surface-variant font-label-md text-label-md">
              <a routerLink="/platform-admin" class="hover:text-pa-primary transition-colors cursor-pointer">Platform</a>
              <span class="text-pa-outline-variant">/</span>
              <a routerLink="/platform-admin/tenants" class="hover:text-pa-primary transition-colors cursor-pointer">Tenants</a>
              <span class="text-pa-outline-variant">/</span>
              <span class="text-pa-on-surface font-semibold">{{ tenant.tradeName }}</span>
              <span class="bg-pa-surface-container-high text-pa-on-surface-variant font-mono px-2 py-0.5 rounded text-[11px] ml-space-xs">
                {{ tenant.id }}
              </span>
            </div>
            <div class="flex items-center gap-space-sm">
              <div class="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-pa-surface-container-lowest shadow-sm">
                <span class="w-2 h-2 rounded-full" [class]="statusDotClass(tenant.status)"></span>
                <span class="font-label-sm text-label-sm font-semibold text-pa-primary">{{ statusLabel(tenant.status) }}</span>
                <span class="text-pa-outline-variant text-[10px]">•</span>
                <span class="font-label-sm text-label-sm text-pa-on-surface-variant">{{ countryName(tenant.countryCode) }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div class="flex items-start gap-space-md">
              <div
                class="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0 bg-pa-surface-container-high flex items-center justify-center font-bold text-pa-primary text-headline-sm"
              >
                @if (tenant.branding?.logoUrl) {
                  <img class="w-full h-full object-cover" [src]="tenant.branding?.logoUrl" [alt]="tenant.tradeName" />
                } @else {
                  {{ initials(tenant.tradeName) }}
                }
              </div>
              <div class="flex flex-col">
                <div class="flex flex-wrap items-center gap-space-sm">
                  <h1 class="font-headline-lg text-headline-lg text-pa-on-surface tracking-tight">{{ tenant.tradeName }}</h1>
                  <span class="font-label-sm text-label-sm bg-pa-surface-container px-2 py-0.5 rounded text-pa-on-surface-variant">{{ tenant.legalName }}</span>
                </div>
                <div class="flex flex-wrap items-center gap-space-sm mt-1">
                  <span class="inline-flex items-center gap-1 text-pa-primary font-label-md text-label-md font-mono">{{ tenant.slug }}</span>
                  <span class="text-pa-outline-variant">·</span>
                  <span class="font-body-sm text-body-sm text-pa-on-surface-variant">Registrado el {{ tenant.createdAt | date: 'dd MMMM, yyyy' }}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-space-xs">
              <button
                type="button"
                disabled
                title="Plan / suscripción: la API de plataforma no expone planes"
                class="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-pa-surface-container-high text-pa-on-surface font-label-md text-label-md transition-all shadow-sm opacity-40 cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[18px]">tune</span>
                <span>Editar Plan</span>
              </button>
              <button
                type="button"
                disabled
                title="Suspensión: pendiente de endpoint en la API de plataforma"
                class="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-pa-error-container text-pa-on-error-container font-label-md text-label-md transition-all shadow-sm opacity-40 cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[18px]">pause_circle</span>
                <span>Suspender</span>
              </button>
              <button
                type="button"
                disabled
                title="Impersonación: pendiente de endpoint en la API de plataforma"
                class="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-pa-primary text-pa-on-primary font-label-md text-label-md transition-all shadow-sm opacity-40 cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[18px]">switch_account</span>
                <span>Impersonate Owner</span>
              </button>
            </div>
          </div>

          <!-- Tabbed Navigation -->
          <div class="flex items-center gap-space-xs overflow-x-auto pb-1 mt-space-xs">
            @for (tab of tabs; track tab.key) {
              <button
                type="button"
                (click)="selectTab(tab)"
                [title]="tab.pending ? 'Sección sin datos: la API de plataforma aún no la expone' : null"
                class="px-space-md py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 shrink-0 transition-colors"
                [class.bg-pa-surface-container-lowest]="activeTab() === tab.key"
                [class.text-pa-primary]="activeTab() === tab.key"
                [class.font-semibold]="activeTab() === tab.key"
                [class.shadow-sm]="activeTab() === tab.key"
                [class.text-pa-on-surface-variant]="activeTab() !== tab.key"
                [class.hover:text-pa-on-surface]="activeTab() !== tab.key"
                [class.hover:bg-pa-surface-container-high]="activeTab() !== tab.key"
              >
                <span class="material-symbols-outlined text-[18px]">{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
              </button>
            }
          </div>
        </section>

        @if (activePendingTab(); as pendingTab) {
          <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-dashed border-pa-outline-variant flex flex-col items-center gap-space-sm text-center">
            <span class="material-symbols-outlined text-[36px] text-pa-outline">{{ pendingTab.icon }}</span>
            <h2 class="font-headline-sm text-headline-sm text-pa-on-surface">{{ pendingTab.label }}</h2>
            <p class="font-body-md text-body-md text-pa-on-surface-variant max-w-xl">
              La API de plataforma expone únicamente el catálogo de tenants
              (<code class="font-mono text-pa-primary">GET /admin/tenants</code>). Esta sección se mostrará
              cuando exista su endpoint correspondiente.
            </p>
          </div>
        } @else {
          <!-- Top Metric Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div class="p-space-md bg-pa-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant font-semibold">Antigüedad</span>
                <div class="w-8 h-8 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary">
                  <span class="material-symbols-outlined text-[18px]">event_upcoming</span>
                </div>
              </div>
              <div class="mt-space-md">
                <div class="flex items-baseline gap-space-xs">
                  <span class="font-headline-lg text-headline-lg text-pa-on-surface">{{ ageInDays() }}</span>
                  <span class="font-label-md text-label-md text-pa-on-surface-variant font-medium">días</span>
                </div>
                <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">{{ relativeTime(tenant.createdAt) }}</p>
              </div>
            </div>
            <div class="p-space-md bg-pa-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant font-semibold">Estado</span>
                <div class="w-8 h-8 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-secondary">
                  <span class="material-symbols-outlined text-[18px]">verified</span>
                </div>
              </div>
              <div class="mt-space-md">
                <div class="flex items-baseline gap-space-xs">
                  <span class="font-title-md text-title-md text-pa-on-surface font-semibold">{{ statusLabel(tenant.status) }}</span>
                </div>
                <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Ciclo de vida de la instancia</p>
              </div>
            </div>
            <div class="p-space-md bg-pa-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant font-semibold">País</span>
                <div class="w-8 h-8 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-primary">
                  <span class="material-symbols-outlined text-[18px]">public</span>
                </div>
              </div>
              <div class="mt-space-md">
                <div class="flex items-baseline gap-space-xs">
                  <span class="font-title-md text-title-md text-pa-on-surface font-semibold">{{ countryName(tenant.countryCode) }}</span>
                </div>
                <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Código ISO: {{ tenant.countryCode }}</p>
              </div>
            </div>
            <div class="p-space-md bg-pa-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant font-semibold">Tipo de Negocio</span>
                <div class="w-8 h-8 rounded-lg bg-pa-surface-container flex items-center justify-center text-pa-tertiary">
                  <span class="material-symbols-outlined text-[18px]">category</span>
                </div>
              </div>
              <div class="mt-space-md">
                <div class="flex items-baseline gap-space-xs">
                  <span class="font-title-md text-title-md text-pa-on-surface font-semibold">{{ businessTypeLabel(tenant.businessType) }}</span>
                </div>
                <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">Identificador: {{ tenant.slug }}</p>
              </div>
            </div>
          </div>

          <!-- Main Content 2-Column Inspector Split (2/3 vs 1/3) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div class="lg:col-span-8 flex flex-col gap-space-lg">
              <!-- Datos Legales & Contacto -->
              <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <div class="flex items-center justify-between pb-space-md">
                  <div class="flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-pa-primary text-[20px]">corporate_fare</span>
                    <h2 class="font-headline-md text-headline-md text-pa-on-surface">Datos Legales &amp; Contacto Corporativo</h2>
                  </div>
                  <button
                    type="button"
                    disabled
                    title="Edición de ficha: pendiente de endpoint en la API de plataforma"
                    class="text-pa-primary font-label-md text-label-md font-semibold flex items-center gap-1 opacity-40 cursor-not-allowed"
                  >
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                    <span>Editar Ficha</span>
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                  <div class="flex flex-col p-space-md bg-pa-surface rounded-lg">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant">Razón Social</span>
                    <span class="font-title-md text-title-md text-pa-on-surface font-semibold mt-1">{{ tenant.legalName }}</span>
                    <span class="font-data-tabular text-data-tabular text-pa-on-surface-variant mt-0.5">Nombre comercial: {{ tenant.tradeName }}</span>
                  </div>
                  <div class="flex flex-col p-space-md bg-pa-surface rounded-lg">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant">Contacto Registrado</span>
                    <div class="flex items-center gap-space-sm mt-1">
                      <div class="w-8 h-8 rounded-full bg-pa-secondary flex items-center justify-center text-pa-on-secondary font-label-md font-semibold">
                        {{ initials(tenant.tradeName) }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-title-md text-title-md text-pa-on-surface font-semibold">{{ tenant.tradeName }}</span>
                        <span class="font-body-sm text-body-sm text-pa-on-surface-variant">Propietario del tenant</span>
                      </div>
                    </div>
                    <span class="font-data-tabular text-data-tabular text-pa-on-surface-variant mt-2">Teléfono: {{ tenant.phone || 'no registrado' }}</span>
                  </div>
                  <div class="flex flex-col p-space-md bg-pa-surface rounded-lg">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant">Identificadores de Instancia</span>
                    <span class="font-title-md text-title-md text-pa-on-surface font-semibold mt-1 font-mono truncate">{{ tenant.slug }}</span>
                    <span class="font-data-tabular text-data-tabular text-pa-on-surface-variant mt-0.5">UUID: {{ tenant.id }}</span>
                  </div>
                  <div class="flex flex-col p-space-md bg-pa-surface rounded-lg">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant">Ubicación &amp; Registro</span>
                    <span class="font-title-md text-title-md text-pa-on-surface font-semibold mt-1">{{ countryName(tenant.countryCode) }}</span>
                    <span class="font-body-sm text-body-sm text-pa-on-surface-variant mt-0.5">
                      Alta en la plataforma: {{ tenant.createdAt | date: 'dd MMMM, yyyy' }}
                    </span>
                    <span class="font-label-sm text-label-sm text-pa-primary mt-space-xs">{{ ageInDays() }} días en la red</span>
                  </div>
                </div>
              </div>

              <!-- Branding -->
              <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <div class="flex items-center justify-between pb-space-md">
                  <div class="flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-pa-primary text-[20px]">palette</span>
                    <h2 class="font-headline-md text-headline-md text-pa-on-surface">Branding &amp; Presencia en Canales</h2>
                  </div>
                  <span class="font-label-sm text-label-sm bg-pa-surface-container px-2.5 py-1 rounded-full text-pa-on-surface-variant font-medium">White-Label</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  <div class="flex flex-col p-space-md bg-pa-surface rounded-lg">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant mb-space-sm">Identidad Gráfica</span>
                    <div class="h-28 w-full rounded-lg overflow-hidden relative shadow-sm mb-space-sm bg-pa-surface-container-high flex items-center justify-center">
                      @if (tenant.branding?.logoUrl) {
                        <img class="w-full h-full object-cover" [src]="tenant.branding?.logoUrl" [alt]="tenant.tradeName" />
                      } @else {
                        <span class="material-symbols-outlined text-[36px] text-pa-outline">image_not_supported</span>
                      }
                    </div>
                    <div class="flex items-center justify-between text-body-sm">
                      <span class="font-label-sm text-label-sm text-pa-on-surface-variant">Logo:</span>
                      <span class="font-mono font-data-tabular text-data-tabular text-pa-on-surface">
                        {{ tenant.branding?.logoUrl ? 'configurado' : 'no configurado' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col p-space-md bg-pa-surface rounded-lg">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant mb-space-sm">Color Primario</span>
                    <div class="h-28 w-full rounded-lg overflow-hidden relative shadow-sm mb-space-sm bg-pa-surface-container-high flex items-center justify-center">
                      <span
                        class="w-16 h-16 rounded-xl shadow-md"
                        [style.background-color]="tenant.branding?.primaryColor || '#e4e2de'"
                      ></span>
                    </div>
                    <div class="flex items-center justify-between text-body-sm">
                      <span class="font-label-sm text-label-sm text-pa-on-surface-variant">Valor:</span>
                      <span class="font-mono font-data-tabular text-data-tabular text-pa-on-surface">
                        {{ tenant.branding?.primaryColor || '—' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col p-space-md bg-pa-surface rounded-lg">
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant mb-space-sm">Canales</span>
                    <div class="flex flex-col gap-space-sm flex-1 justify-center">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="material-symbols-outlined text-[18px] text-pa-primary">public</span>
                          <span class="font-title-md text-title-md text-pa-on-surface">Reserva Pública</span>
                        </div>
                        <span class="w-2 h-2 rounded-full bg-pa-outline-variant"></span>
                      </div>
                      <p class="font-body-sm text-body-sm text-pa-on-surface-variant">
                        La plataforma no expone el estado de integraciones por tenant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Infraestructura -->
              <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-space-sm pb-space-md">
                  <div class="flex items-center gap-space-xs">
                    <span class="material-symbols-outlined text-pa-primary text-[20px]">dns</span>
                    <div>
                      <h2 class="font-headline-md text-headline-md text-pa-on-surface">Infraestructura &amp; Salud de Base de Datos</h2>
                      <p class="font-body-sm text-body-sm text-pa-on-surface-variant">Instancia aislada dedicada a este tenant</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="store.refresh()"
                    [disabled]="store.loading()"
                    title="Refrescar métricas"
                    class="p-1.5 rounded-lg bg-pa-surface-container hover:bg-pa-surface-container-high text-pa-on-surface-variant transition-colors"
                  >
                    <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="store.loading()">refresh</span>
                  </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-space-sm mb-space-md">
                  <div class="p-space-md bg-pa-surface rounded-lg flex flex-col">
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase font-semibold">Tenant ID</span>
                    <span class="font-title-md text-title-md text-pa-on-surface font-mono truncate mt-1">{{ tenant.id }}</span>
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant mt-1">Identificador en la plataforma</span>
                  </div>
                  <div class="p-space-md bg-pa-surface rounded-lg flex flex-col">
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase font-semibold">Subdominio</span>
                    <span class="font-title-md text-title-md text-pa-on-surface font-mono truncate mt-1">{{ tenant.slug }}</span>
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant mt-1">Host derivado del slug</span>
                  </div>
                  <div class="p-space-md bg-pa-surface rounded-lg flex flex-col">
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase font-semibold">Conexión API</span>
                    <span class="font-title-md text-title-md font-semibold mt-1" [class.text-pa-primary]="!store.offline()" [class.text-pa-error]="store.offline()">
                      {{ store.offline() ? 'Offline' : 'Conectada' }}
                    </span>
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant mt-1">
                      {{ store.lastSyncedAt() ? 'Sync ' + syncLabel() : 'Sin sincronizar' }}
                    </span>
                  </div>
                  <div class="p-space-md bg-pa-surface rounded-lg flex flex-col">
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant uppercase font-semibold">Aislamiento</span>
                    <span class="font-title-md text-title-md text-pa-on-surface font-semibold mt-1">1 tenant</span>
                    <span class="font-label-sm text-label-sm text-pa-on-surface-variant mt-1">Instancia dedicada</span>
                  </div>
                </div>
                <div class="p-space-md bg-pa-surface rounded-lg flex flex-wrap items-center justify-between gap-space-md">
                  <div class="flex items-center gap-space-md">
                    <div class="w-10 h-10 rounded-full bg-pa-surface-container-high flex items-center justify-center text-pa-primary">
                      <span class="material-symbols-outlined text-[20px]">cloud_sync</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-title-md text-title-md text-pa-on-surface font-semibold">Métricas de base de datos no expuestas</span>
                      <span class="font-body-sm text-body-sm text-pa-on-surface-variant">
                        Tamaño en disco, pool de conexiones y backups requieren un endpoint dedicado por tenant.
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-space-xs">
                    <button
                      type="button"
                      disabled
                      title="Snapshot manual: pendiente de endpoint en la API de plataforma"
                      class="px-space-md py-1.5 rounded-lg bg-pa-surface-container-high text-pa-on-surface font-label-md text-label-md opacity-40 cursor-not-allowed"
                    >
                      Ejecutar Snapshot Manual
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="lg:col-span-4 flex flex-col gap-space-lg">
              <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <div class="flex items-center justify-between pb-space-sm">
                  <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant font-semibold">Estado de la Instancia</span>
                  <span class="font-label-sm text-label-sm bg-pa-surface-container px-2.5 py-0.5 rounded-full font-semibold text-pa-on-surface-variant">
                    {{ statusLabel(tenant.status) }}
                  </span>
                </div>
                <div class="mt-space-xs">
                  <h3 class="font-headline-md text-headline-md text-pa-on-surface">{{ tenant.tradeName }}</h3>
                  <div class="flex items-baseline gap-1 mt-1">
                    <span class="font-headline-lg text-headline-lg text-pa-primary">{{ ageInDays() }}</span>
                    <span class="font-body-md text-body-md text-pa-on-surface-variant">días en la plataforma</span>
                  </div>
                  <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-1">
                    Registrado el {{ tenant.createdAt | date: 'dd MMMM, yyyy' }} ({{ relativeTime(tenant.createdAt) }}).
                  </p>
                </div>
                <div class="flex flex-col gap-space-xs mt-space-md p-space-md bg-pa-surface rounded-lg">
                  <div class="flex items-center justify-between text-body-sm">
                    <span class="text-pa-on-surface-variant">País:</span>
                    <span class="font-semibold text-pa-on-surface">{{ countryName(tenant.countryCode) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-body-sm">
                    <span class="text-pa-on-surface-variant">Tipo:</span>
                    <span class="font-semibold text-pa-on-surface">{{ businessTypeLabel(tenant.businessType) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-body-sm">
                    <span class="text-pa-on-surface-variant">Estado API:</span>
                    <span class="inline-flex items-center gap-1 font-semibold" [class.text-pa-primary]="!store.offline()" [class.text-pa-error]="store.offline()">
                      <span class="w-1.5 h-1.5 rounded-full" [class.bg-pa-primary]="!store.offline()" [class.bg-pa-error]="store.offline()"></span>
                      {{ store.offline() ? 'No disponible' : 'Operativa' }}
                    </span>
                  </div>
                </div>
                <a
                  routerLink="/platform-admin/tenants"
                  class="w-full mt-space-md py-2 rounded-lg bg-pa-secondary text-pa-on-secondary hover:bg-pa-tertiary font-label-md text-label-md transition-all shadow-sm text-center"
                >
                  Volver al directorio
                </a>
              </div>

              <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-dashed border-pa-outline-variant">
                <div class="flex items-center justify-between pb-space-md">
                  <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant font-semibold">Suscripción &amp; Cuotas</span>
                  <span class="material-symbols-outlined text-[18px] text-pa-on-surface-variant">data_usage</span>
                </div>
                <p class="font-body-md text-body-md text-pa-on-surface-variant">
                  La API de plataforma no expone plan, MRR, límites de uso ni facturación por tenant.
                  Esta sección se completará cuando exista su endpoint.
                </p>
              </div>

              <div class="bg-pa-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-dashed border-pa-outline-variant flex flex-col">
                <div class="flex items-center justify-between pb-space-sm">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px] text-pa-primary">history_toggle_off</span>
                    <span class="font-label-sm text-label-sm uppercase tracking-wider text-pa-on-surface-variant font-semibold">Bitácora Reciente</span>
                  </div>
                </div>
                <div class="relative pl-4 space-y-space-md mt-space-sm before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-pa-surface-container-high">
                  <div class="relative flex flex-col gap-0.5">
                    <div class="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-pa-primary ring-4 ring-pa-surface-container-lowest"></div>
                    <div class="flex items-center justify-between text-label-sm">
                      <span class="font-semibold text-pa-on-surface">Tenant registrado</span>
                      <span class="text-pa-on-surface-variant font-mono">{{ tenant.createdAt | date: 'dd MMM, HH:mm' }}</span>
                    </div>
                    <p class="font-body-sm text-body-sm text-pa-on-surface-variant">
                      Alta de “{{ tenant.tradeName }}” en el catálogo multi-tenant.
                    </p>
                  </div>
                  <div class="relative flex flex-col gap-0.5">
                    <div class="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-pa-surface-container-highest ring-4 ring-pa-surface-container-lowest"></div>
                    <div class="flex items-center justify-between text-label-sm">
                      <span class="font-semibold text-pa-on-surface">Última sincronización</span>
                      <span class="text-pa-on-surface-variant font-mono">{{ syncLabel() }}</span>
                    </div>
                    <p class="font-body-sm text-body-sm text-pa-on-surface-variant">
                      Consulta de la ficha desde la consola de Super Admin.
                    </p>
                  </div>
                </div>
                <p class="font-body-sm text-body-sm text-pa-on-surface-variant mt-space-md">
                  El historial completo de auditoría requiere un endpoint dedicado.
                </p>
              </div>
            </div>
          </div>
        }
      } @else if (store.loading()) {
        <div class="flex flex-col gap-space-md pt-space-md">
          <div class="h-6 w-64 rounded bg-pa-surface-container animate-pulse"></div>
          <div class="h-32 rounded-xl bg-pa-surface-container animate-pulse"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            @for (card of [1, 2, 3, 4]; track card) {
              <div class="h-28 rounded-xl bg-pa-surface-container animate-pulse"></div>
            }
          </div>
        </div>
      } @else {
        <div class="bg-pa-surface-container-lowest rounded-xl p-space-xl flex flex-col items-center gap-space-sm text-center">
          <span class="material-symbols-outlined text-[40px] text-pa-outline">domain_disabled</span>
          <h1 class="font-headline-md text-headline-md text-pa-on-surface">Tenant no encontrado</h1>
          <p class="font-body-md text-body-md text-pa-on-surface-variant max-w-xl">
            @if (store.offline()) {
              No hay conexión con la API de plataforma, por lo que no se puede resolver el tenant.
            } @else {
              El tenant <span class="font-mono text-pa-primary">{{ tenantId() }}</span> no está en los
              {{ store.tenants().length }} registros cargados. La API expone un máximo de
              {{ store.filters().limit }} instancias por consulta.
            }
          </p>
          <div class="flex items-center gap-space-sm mt-space-sm">
            <a
              routerLink="/platform-admin/tenants"
              class="bg-pa-surface-container hover:bg-pa-surface-container-high text-pa-on-surface px-space-md py-2 rounded-lg font-label-md text-label-md"
            >
              Volver al directorio
            </a>
            <button
              type="button"
              (click)="store.refresh()"
              class="bg-pa-primary hover:bg-pa-primary-container text-pa-on-primary px-space-md py-2 rounded-lg font-label-md text-label-md"
            >
              Reintentar
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class PlatformAdminTenantDetailComponent implements OnInit {
  readonly store = inject(PlatformAdminStore)
  private route = inject(ActivatedRoute)

  readonly tenantId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), {
    initialValue: '',
  })

  readonly activeTab = signal('resumen')

  readonly currentTenant = computed(() => this.store.tenantById(this.tenantId()))

  readonly tabs: DetailTab[] = [
    { key: 'resumen', label: '1. Resumen', icon: 'analytics', pending: false },
    { key: 'sucursales', label: '2. Sucursales & Mapa', icon: 'location_on', pending: true },
    { key: 'equipo', label: '3. Equipo & Roles', icon: 'group', pending: true },
    { key: 'facturacion', label: '4. Facturación & Uso', icon: 'credit_card', pending: true },
    { key: 'base-datos', label: '5. Base de Datos', icon: 'database', pending: true },
    { key: 'auditoria', label: '6. Logs de Auditoría', icon: 'history', pending: true },
  ]

  readonly activePendingTab = computed(() =>
    this.tabs.find((tab) => tab.key === this.activeTab() && tab.pending) ?? null
  )

  ngOnInit(): void {
    this.store.load()
  }

  selectTab(tab: DetailTab): void {
    this.activeTab.set(tab.key)
  }

  ageInDays(): number {
    const tenant = this.currentTenant()
    return tenant ? tenantAgeInDays(tenant) : 0
  }

  statusLabel(status: TenantStatus): string {
    return TENANT_STATUS_LABELS[status]
  }

  syncLabel(): string {
    const syncedAt = this.store.lastSyncedAt()
    return syncedAt ? syncedAt.toLocaleTimeString() : '—'
  }

  initials = initials
  relativeTime = relativeTime
  countryName = countryName
  businessTypeLabel = businessTypeLabel
  statusChipClass = statusChipClass
  statusDotClass = statusDotClass
}
