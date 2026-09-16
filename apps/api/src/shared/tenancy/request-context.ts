import { AsyncLocalStorage } from 'node:async_hooks'

export type RequestContext = {
  tenantId: string
  userId: string
  userRole: string
  databaseUrl: string
  branchId?: string
  requestId: string
  ipAddress?: string
  userAgent?: string
}

const requestContext = new AsyncLocalStorage<RequestContext>()

export function setRequestContext(ctx: RequestContext): void {
  requestContext.enterWith(ctx)
}

export function runWithRequestContext<T>(ctx: RequestContext, callback: () => T): T {
  return requestContext.run(ctx, callback)
}

export function getRequestContext(): RequestContext {
  const context = requestContext.getStore()
  if (!context) {
    throw new Error('No request context available')
  }
  return context
}

export function getTenantId(): string {
  return getRequestContext().tenantId
}

export function clearRequestContext(): void {
  // AsyncLocalStorage clears the context when the request callback completes.
}

export function hasPermission(permission: string, userRole: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    owner: ['*'],
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
      'appointments:read',
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
  }

  const permissions = rolePermissions[userRole]
  if (!permissions) return false
  if (permissions.includes('*')) return true
  return permissions.includes(permission)
}
