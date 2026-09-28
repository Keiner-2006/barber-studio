import { Injectable, signal, computed, inject } from '@angular/core';
import { PlatformAdminStore } from '../platform-admin.store';

@Injectable({ providedIn: 'root' })
export class ClientsStore {
  private readonly adminStore = inject(PlatformAdminStore);

  readonly owners = computed(() => {
    const tenants = this.adminStore.tenants();
    return tenants
      .filter((t) => t.owner !== null)
      .map((t) => ({
        id: t.id,
        email: t.owner!.email,
        name: t.owner!.name,
        tenantId: t.id,
        tradeName: t.tradeName,
        businessType: t.businessType,
        countryCode: t.countryCode,
        status: t.status,
        createdAt: t.createdAt,
      }));
  });
  readonly loading = computed(() => this.adminStore.loading());

  load(): void {
    this.adminStore.load();
  }
}
