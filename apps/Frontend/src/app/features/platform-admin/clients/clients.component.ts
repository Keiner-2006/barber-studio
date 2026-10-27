import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientsStore } from './clients.store';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <p class="label">Gestión de Dueños</p>
          <h1>Clientes<span class="accent">.</span></h1>
          <p class="subtitle">Dueños de negocios registrados en la plataforma.</p>
        </div>
      </div>

      @if (store.loading()) {
        <div class="loading">Cargando clientes...</div>
      } @else if (store.owners().length === 0) {
        <div class="empty-state">
          <span class="material-symbols-outlined" style="font-size:48px">person_add</span>
          <h2>Sin dueños registrados</h2>
          <p>Aún no hay dueños de negocios en la plataforma.</p>
          <a routerLink="/platform-admin/negocios/nuevo" class="button button-dark" style="margin-top:16px;display:inline-flex">
            Agregar Primer Negocio
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          @for (client of store.owners(); track client.id) {
            <div class="card">
              <div class="card-header">
                <div class="flex items-center gap-sm">
                  <div class="avatar">{{ client.name.charAt(0) }}</div>
                  <div>
                    <h3>{{ client.name }}</h3>
                    <span class="email">{{ client.email }}</span>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="info-row">
                  <span class="label">Negocio:</span>
                  <span>{{ client.tradeName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Tipo:</span>
                  <span>{{ client.businessType }}</span>
                </div>
                <div class="info-row">
                  <span class="label">País:</span>
                  <span>{{ client.countryCode }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="status" [class.active]="client.status === 'active'" [class.provisioning]="client.status === 'provisioning'">
                    {{ client.status }}
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <a [routerLink]="['/platform-admin/negocios', client.tenantId]" class="link">Ver Negocio</a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { padding: 32px; max-width: 1200px; margin: 0 auto; font-family: 'Plus Jakarta Sans', sans-serif; }
    .page-header { margin-bottom: 32px; }
    .label { font-size: 13px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1b1c1a; margin: 0; }
    .accent { color: #b87333; }
    .subtitle { font-size: 14px; color: #6b7280; margin-top: 8px; }
    .grid { display: grid; gap: 20px; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .card-header { padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .card-header h3 { font-family: 'DM Serif Display', serif; font-size: 18px; color: #1b1c1a; margin: 0; }
    .email { font-size: 13px; color: #6b7280; }
    .card-body { padding: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .info-row .label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .card-footer { padding: 16px 20px; border-top: 1px solid #e5e7eb; }
    .link { font-size: 13px; color: #b87333; text-decoration: none; font-weight: 500; }
    .link:hover { text-decoration: underline; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; background: #b87333; color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; }
    .loading { padding: 40px; text-align: center; color: #6b7280; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: #6b7280; gap: 12px; text-align: center; }
    .empty-state h2 { font-family: 'DM Serif Display', serif; font-size: 24px; color: #1b1c1a; }
    .empty-state p { font-size: 14px; }
    .status { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status.active { background: #dcfce7; color: #166534; }
    .status.provisioning { background: #fef3c7; color: #92400e; }
    .button { padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
    .button-dark { background: #1b1c1a; color: white; }
    .button-dark:hover { background: #374151; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .gap-sm { gap: 12px; }
    .h-3 { height: 3px; }
  `]
})
export class ClientsComponent implements OnInit {
  readonly store = inject(ClientsStore)

  ngOnInit(): void {
    this.store.load()
  }
}
