export type TenantStatus = 'provisioning' | 'active' | 'suspended' | 'deleting' | 'deleted';

export type BusinessType = 'barberia' | 'peluqueria' | 'grooming' | 'otro';

export type TenantViewMode = 'table' | 'grid';

export interface TenantBranding {
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface TenantOwner {
  name: string;
  email: string;
}

/** Row of GET /admin/tenants?list=true. */
export interface PlatformTenant {
  id: string;
  legalName: string;
  tradeName: string;
  slug: string;
  businessType: BusinessType;
  status: TenantStatus;
  countryCode: string;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  createdAt: string;
  branding: TenantBranding | null;
  owner: TenantOwner | null;
}

/** Body of GET /admin/tenants. `tenants` is only present when `list=true` is sent. */
export interface AdminTenantsPayload {
  total: number;
  countsByStatus: Partial<Record<TenantStatus, number>>;
  tenants?: PlatformTenant[] | null;
}

export interface TenantUsage {
  branches: number;
  staff: number;
  services: number;
  customers: number;
  appointmentsTotal: number;
  appointments30d: number;
  revenue30d: number;
  lastAppointmentAt: string | null;
}

export interface TenantBranch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  status: 'active' | 'inactive';
  operatingHours: Record<string, string> | null;
  createdAt: string;
}

export interface TenantStaffMember {
  id: string;
  displayName: string;
  status: string;
  isBookable: boolean;
  branchName: string | null;
}

export interface TenantMember {
  role: string;
  status: string;
  name: string;
  email: string;
  lastLoginAt: string | null;
}

export interface AuditEvent {
  id: string;
  actorId: string | null;
  tenantId: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  result: string | null;
  metadata: string | null;
  ipAddress: string | null;
  createdAt: string;
}

/** Body of GET /admin/tenants/:id. */
export interface TenantDetail extends Omit<PlatformTenant, 'branding' | 'city'> {
  timezone: string;
  currencyCode: string;
  updatedAt: string;
  location: { city?: string | null; neighborhood?: string | null; address?: string | null; email?: string | null } | null;
  branding:
    | (TenantBranding & { description: string | null; socialLinks: Record<string, string> | null; publicBookingEnabled: boolean })
    | null;
  members: TenantMember[];
  usage: TenantUsage;
  branches: TenantBranch[];
  staff: TenantStaffMember[];
  audit: AuditEvent[];
}

/** Row of GET /admin/users?role=owner. */
export interface PlatformOwner {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  status: 'active' | 'invited' | 'blocked';
  lastLoginAt: string | null;
  createdAt: string;
  tenants: { id: string; tradeName: string; slug: string; status: TenantStatus; countryCode: string }[];
}

/** Body of POST /admin/tenants. The owner must already have an account. */
export interface CreateTenantInput {
  tradeName: string;
  legalName: string;
  slug: string;
  businessType: BusinessType;
  countryCode: string;
  ownerEmail: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  address?: string;
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

export const DEFAULT_TENANT_FILTERS: TenantFilters = { search: '', status: null, country: null, limit: 200 };

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  active: 'Activo',
  provisioning: 'Pendiente',
  suspended: 'Suspendido',
  deleting: 'Eliminando',
  deleted: 'Eliminado',
};

/** Display order for filters and the status breakdown. */
export const TENANT_STATUS_ORDER: TenantStatus[] = ['active', 'provisioning', 'suspended', 'deleting', 'deleted'];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  barberia: 'Barbería',
  peluqueria: 'Peluquería',
  grooming: 'Grooming',
  otro: 'Otro',
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

export const ROLE_NAMES: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  reception: 'Recepción',
  barber: 'Barbero',
  inventory_manager: 'Inventario',
  accountant: 'Contabilidad',
  platform_admin: 'Admin plataforma',
  platform_support: 'Soporte plataforma',
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'tenant.create': 'Negocio creado',
  'tenant.suspend': 'Negocio suspendido',
  'tenant.activate': 'Negocio activado',
  'platform_admin.grant': 'Permiso de admin otorgado',
  'platform_admin.revoke': 'Permiso de admin revocado',
};
