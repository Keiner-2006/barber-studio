// Permission names are also exposed by GET /tenants/me for navigation.
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  platform_admin: ['*'],
  admin: [
    'branches:read', 'branches:write',
    'catalog:read', 'catalog:write',
    'customers:read', 'customers:write',
    'appointments:read', 'appointments:write',
    'inventory:read', 'inventory:write',
    'purchasing:read', 'purchasing:write',
    'cash:read', 'cash:write',
    'reports:read',
    'users:read', 'users:write',
  ],
  app: [
    'branches:read',
    'catalog:read',
    'customers:read',
    'appointments:read', 'appointments:write',
    'inventory:read',
    'purchasing:read',
    'cash:read',
    'reports:read',
  ],
  reception: [
    'customers:read', 'customers:write',
    'appointments:read', 'appointments:write',
    'catalog:read',
    'cash:read', 'cash:write',
  ],
  barber: [
    'appointments:read', 'appointments:write',
    'customers:read',
    'catalog:read',
  ],
  inventory_manager: [
    'inventory:read', 'inventory:write',
    'purchasing:read', 'purchasing:write',
    'catalog:read',
  ],
  accountant: [
    'reports:read',
    'cash:read',
    'purchasing:read',
  ],
  customer: [
    'appointments:read',
    'customers:read',
  ],
  platform_support: [
    'reports:read',
    'users:read',
  ],
};

export function permissionsForRole(role: string): string[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}
