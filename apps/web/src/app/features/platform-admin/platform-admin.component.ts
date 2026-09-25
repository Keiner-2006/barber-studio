import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { AuthGuard } from '../../core/auth/auth.guard'

@Component({
  selector: 'app-platform-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthGuard],
  template: `
    <aside class="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_4px_20px_-2px_rgba(10,7,5,0.65)]">
      <div class="flex flex-col">
        <div class="h-16 px-space-md flex items-center justify-between bg-surface-container-lowest/50">
          <div class="flex items-center gap-space-sm">
            <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[20px]">carpenter</span>
            </div>
            <div class="flex flex-col">
              <span class="font-headline-sm text-headline-sm text-primary leading-none tracking-tight">Navaja</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Studio OS</span>
            </div>
          </div>
          <span class="px-space-xs py-0.5 rounded bg-primary-container/20 text-primary font-label-sm text-label-sm tracking-widest uppercase">Admin</span>
        </div>
        <div class="px-space-md pt-space-lg pb-space-xs">
          <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">Infrastructure &amp; Operations</span>
        </div>
        <nav class="px-space-sm flex flex-col gap-space-xs" data-active-classes="bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-[0_2px_12px_rgba(217,142,58,0.15)]">
          <a aria-current="page" class="flex items-center gap-space-sm px-space-md py-space-sm transition-all bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-[0_2px_12px_rgba(217,142,58,0.15)]" data-path="tenants" href="#">
            <span class="material-symbols-outlined text-[20px]">storefront</span>
            <span class="font-label-lg text-label-lg">Tenants</span>
          </a>
          <a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="provisioning-jobs" href="#">
            <span class="material-symbols-outlined text-[20px]">terminal</span>
            <span class="font-label-lg text-label-lg">Provisioning Jobs</span>
          </a>
          <a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="media-assets" href="#">
            <span class="material-symbols-outlined text-[20px]">perm_media</span>
            <span class="font-label-lg text-label-lg">Media Assets</span>
          </a>
          <a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="audit-logs" href="#">
            <span class="material-symbols-outlined text-[20px]">history_edu</span>
            <span class="font-label-lg text-label-lg">Audit Logs</span>
          </a>
          <a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="database-nodes" href="#">
            <span class="material-symbols-outlined text-[20px]">dns</span>
            <span class="font-label-lg text-label-lg">Database Nodes</span>
          </a>
          <a class="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" data-path="platform-settings" href="#">
            <span class="material-symbols-outlined text-[20px]">tune</span>
            <span class="font-label-lg text-label-lg">Platform Settings</span>
          </a>
        </nav>
      </div>
      <div class="p-space-md bg-surface-container-lowest/60">
        <div class="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
          <div class="flex items-center gap-space-xs">
            <span class="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Cluster: latam-south1</span>
          </div>
          <span class="material-symbols-outlined text-outline text-[16px]">lock</span>
        </div>
      </div>
    </aside>
    <div class="pl-72">
      <header class="fixed top-0 left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl z-40 shadow-[0_4px_20px_-2px_rgba(10,7,5,0.65)]">
        <div class="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-md">
            <img class="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1XjNy6dCfh1U0IphF27gf_X79lFfbffHYjqL7v79EQLYd0UsOemeoSVwkWmIs096c2IlisVkYlNtoICyHBavcnIvAszyXyj3zdCIc8_Wyu91-ma7HBZt9haBPgdwXTP5VCUAJa0Xn0XufJ5Gv3v6seiMvoC6nohAKyV5TCjiuOUO0wbYdMJ4jo8Avk18rR0lOt3NiAy302FiOHunX_DecWjFMm0IyqJiOZSQIDH8x1FLQ3Ya12QbYPe_z8" alt="Navaja Studio Logo"/>
            <div class="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high">
              <span class="w-2 h-2 rounded-full bg-tertiary"></span>
              <span class="font-label-sm text-label-sm text-tertiary font-bold tracking-wide uppercase">Production</span>
              <span class="text-outline font-label-sm text-label-sm">•</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">LatAm Edge</span>
            </div>
          </div>
          <div class="flex-1 max-w-lg mx-space-md">
            <div class="relative flex items-center w-full">
              <span class="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
              <input class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm pl-10 pr-space-md py-space-xs rounded-lg outline-none focus:ring-1 focus:ring-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transition-all" placeholder="Search tenants, domain IDs, cluster nodes, or execution traces (⌘K)..." type="text"/>
            </div>
          </div>
          <div class="flex items-center gap-space-md">
            <div class="hidden md:flex flex-col items-end">
              <span class="font-label-md text-label-md text-on-surface font-semibold">Platform Support</span>
              <span class="font-label-sm text-label-sm text-primary">Super Admin</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>
      <main class="w-full pt-16 bg-surface min-h-screen">
        <div class="flex flex-col w-full px-space-lg py-space-lg gap-space-lg">
          <section class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div class="flex flex-col gap-space-xs">
              <div class="flex items-center gap-space-sm flex-wrap">
                <span class="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold px-space-xs py-0.5 rounded bg-surface-container-high">Multi-Tenant Core</span>
                <span class="text-outline font-label-sm text-label-sm">•</span>
                <div class="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high">
                  <span class="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span class="font-label-sm text-label-sm text-tertiary">LatAm Production Cluster (CO, MX)</span>
                </div>
              </div>
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Gestión de Tenants &amp; Instancias SaaS</h1>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                Supervisión multitenant en tiempo real, aprovisionamiento asíncrono y aislamiento de bases de datos PostgreSQL dedicadas para estudios de barbería de alta gama.
              </p>
            </div>
            <div class="flex items-center gap-space-sm shrink-0">
              <button class="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all shadow-sm">
                <span class="material-symbols-outlined text-[18px] text-primary">sync</span>
                <span class="font-label-lg text-label-lg">Actualizar métricas</span>
              </button>
              <button class="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all shadow-sm">
                <span class="material-symbols-outlined text-[18px] text-secondary">file_download</span>
                <span class="font-label-lg text-label-lg">Exportar CSV Audit</span>
              </button>
              <button class="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary-container font-semibold hover:brightness-110 transition-all shadow-md">
                <span class="material-symbols-outlined text-[18px]">add_circle</span>
                <span class="font-label-lg text-label-lg">Nuevo Tenant</span>
              </button>
            </div>
          </section>
          <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
            <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">Total Tenants</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[20px]">corporate_fare</span>
                </div>
              </div>
              <div class="mt-space-md flex items-baseline gap-space-xs">
                <span class="font-headline-lg text-headline-lg text-on-surface">148</span>
                <span class="font-label-sm text-label-sm text-tertiary font-bold flex items-center">
                  <span class="material-symbols-outlined text-[14px]">arrow_upward</span> +12%
                </span>
              </div>
              <span class="font-body-sm text-body-sm text-on-surface-variant mt-1">Registrados en la plataforma</span>
            </div>
            <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">Activos (Online)</span>
                <span class="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm font-bold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 89.2%
                </span>
              </div>
              <div class="mt-space-md flex items-baseline gap-space-xs">
                <span class="font-headline-lg text-headline-lg text-tertiary">132</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">nodos activos</span>
              </div>
              <span class="font-body-sm text-body-sm text-tertiary/80 mt-1">SLA 99.98% de disponibilidad</span>
            </div>
            <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">En Provisioning</span>
                <span class="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              </div>
              <div class="mt-space-md flex items-baseline gap-space-xs">
                <span class="font-headline-lg text-headline-lg text-primary">9</span>
                <span class="font-label-sm text-label-sm text-primary font-bold">Jobs en cola</span>
              </div>
            </div>
            <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">Suspendidos / Mora</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-error">
                  <span class="material-symbols-outlined text-[18px]">warning</span>
                </div>
              </div>
              <div class="mt-space-md flex items-baseline gap-space-xs">
                <span class="font-headline-lg text-headline-lg text-error">5</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">requieren acción</span>
              </div>
            </div>
            <div class="bg-surface-container p-space-md rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider">Eliminados / Deleting</span>
                <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                  <span class="material-symbols-outlined text-[18px]">delete_sweep</span>
                </div>
              </div>
              <div class="mt-space-md flex items-baseline gap-space-xs">
                <span class="font-headline-lg text-headline-lg text-secondary">2</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">en purga</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
})
export class PlatformAdminComponent {}
