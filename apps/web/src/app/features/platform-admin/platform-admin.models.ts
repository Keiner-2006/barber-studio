export type TenantStatus = 'provisioning' | 'active' | 'suspended' | 'deleting' | 'deleted';

export type BusinessType = 'barberia' | 'peluqueria' | 'grooming' | 'otro';

export type ProvisioningJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'compensated';

export type TenantViewMode = 'table' | 'grid';

export interface TenantBranding {
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface PlatformTenant {
  id: string;
  legalName: string;
  tradeName: string;
  slug: string;
  businessType: BusinessType;
  status: TenantStatus;
  countryCode: string;
  phone: string | null;
  createdAt: string;
  branding: TenantBranding | null;
  owner: { name: string; email: string } | null;
}

/**
 * Body of GET /admin/tenants.
 * `tenants` is only present when `list=true` is sent.
 */
export interface AdminTenantsPayload {
  total: number;
  countsByStatus: Partial<Record<TenantStatus, number>>;
  tenants?: PlatformTenant[] | null;
}

export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  provisioningTenants: number;
  suspendedTenants: number;
  deletingTenants: number;
  deletedTenants: number;
  activeRatio: number;
  isEmpty: boolean;
  totalNegocios: number;
  activeNegocios: number;
  provisioningNegocios: number;
  suspendedNegocios: number;
}

/** One bar of the status distribution chart. Always derived, never hardcoded. */
export interface StatusSlice {
  status: TenantStatus;
  label: string;
  count: number;
  ratio: number;
  barClass: string;
  textClass: string;
}

/** One row of the geographic distribution. Derived from the loaded tenants. */
export interface CountrySlice {
  code: string;
  count: number;
  ratio: number;
}

export interface TenantFilters {
  search: string;
  status: TenantStatus | null;
  country: string | null;
  limit: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
}

export const DEFAULT_TENANT_FILTERS: TenantFilters = {
  search: '',
  status: null,
  country: null,
  limit: 200,
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  active: 'Activo',
  provisioning: 'Provisioning',
  suspended: 'Suspendido',
  deleting: 'Eliminando',
  deleted: 'Eliminado',
};

/** Display order used by the status filter chips. */
export const TENANT_STATUS_ORDER: TenantStatus[] = [
  'active',
  'provisioning',
  'suspended',
  'deleting',
  'deleted',
];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  barberia: 'Barbería',
  peluqueria: 'Peluquería',
  grooming: 'Grooming',
  otro: 'Otro',
};

export const STATUS_BAR_CLASSES: Record<TenantStatus, string> = {
  active: 'bg-pa-primary',
  provisioning: 'bg-pa-primary-container',
  suspended: 'bg-pa-secondary',
  deleting: 'bg-pa-outline',
  deleted: 'bg-pa-outline-variant',
};

export const STATUS_TEXT_CLASSES: Record<TenantStatus, string> = {
  active: 'text-pa-primary',
  provisioning: 'text-pa-primary-container',
  suspended: 'text-pa-secondary',
  deleting: 'text-pa-outline',
  deleted: 'text-pa-outline',
};

export const STATUS_CHIP_CLASSES: Record<TenantStatus, string> = {
  active: 'bg-pa-surface-container text-pa-primary',
  provisioning: 'bg-pa-primary-fixed text-pa-primary',
  suspended: 'bg-pa-surface-container-highest text-pa-secondary',
  deleting: 'bg-pa-surface-container-highest text-pa-outline',
  deleted: 'bg-pa-surface-container text-pa-outline',
};

export const STATUS_DOT_CLASSES: Record<TenantStatus, string> = {
  active: 'bg-pa-primary',
  provisioning: 'bg-pa-primary animate-ping',
  suspended: 'bg-pa-secondary',
  deleting: 'bg-pa-outline',
  deleted: 'bg-pa-outline',
};

export const COUNTRY_NAMES: Record<string, string> = {
  CO: 'Colombia',
  MX: 'México',
  CL: 'Chile',
  AR: 'Argentina',
  PE: 'Perú',
  EC: 'Ecuador',
  US: 'Estados Unidos',
  ES: 'España',
};
