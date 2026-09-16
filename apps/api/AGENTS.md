<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
## Análisis del Sistema de Autenticación Actual

### Arquitectura Actual

El sistema utiliza **better-auth** con una arquitectura multi-tenant:

1. **Plataforma DB**: `platform_users`, `platform_memberships`, `platform_tenants`
2. **Tenant DB**: `users`, `roles`, `userRoles` (roles locales: admin, app, reception, barber, inventory_manager, accountant, customer)
3. **Sistema de permisos**: Función `hasPermission()` en `request-context.ts` con roles predefinidos

### Problema Identificado

El endpoint de login actual (`/api/v1/auth/login`) **no valida el rol del usuario**. Un usuario con credenciales de "Company Member" (rol: admin, app, reception, barber, etc.) puede autenticarse usando el mismo flujo que un "Customer", ya que:

- La función `signIn()` solo verifica email/contraseña
- No hay distinción entre flujos de autenticación por rol
- La respuesta incluye `redirect: '/dashboard'` para todos los usuarios

---

## Plan Técnico para RBAC por Flujo de Autenticación

### 1. Validaciones Backend Requeridas

#### Modificar el endpoint de login para incluir validación de rol

**Archivo:** `apps/api/src/app/api/v1/auth/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'
import { getPlatformDb, getTenantDb } from '@/shared/db'
import { platformUsers, platformMemberships } from '@/shared/db/schema/platform-schema'
import { users, userRoles, roles } from '@/shared/db/schema/identity'
import { eq, and } from 'drizzle-orm'

// Definir los roles que corresponden a cada flujo
const COMPANY_MEMBER_ROLES = ['owner', 'admin', 'app', 'reception', 'barber', 'inventory_manager', 'accountant']
const CUSTOMER_ROLES = ['customer']

async function getUserRole(email: string, tenantId?: string): Promise<string | null> {
  // Buscar en platform DB primero
  const platformDb = getPlatformDb()
  const [platformUser] = await platformDb
    .select({
      userId: platformUsers.id,
      membershipRole: platformMemberships.role,
    })
    .from(platformUsers)
    .innerJoin(platformMemberships, eq(platformMemberships.userId, platformUsers.id))
    .where(eq(platformUsers.email, email))
    .limit(1)

  if (platformUser) {
    return platformUser.membershipRole
  }

  // Si hay tenantId, buscar en tenant DB
  if (tenantId) {
    const tenantDb = getTenantDb()
    const [localUser] = await tenantDb
      .select({
        userId: users.id,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.email, email))
      .limit(1)

    if (localUser && localUser.roleName) {
      return localUser.roleName
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const body = await request.json()
    const { email, password, expectedRole, tenantId } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Email y contraseña son requeridos' }, requestId },
        { status: 400 }
      )
    }

    // Validar que el usuario tenga el rol esperado para este flujo
    const userRole = await getUserRole(email, tenantId)
    
    if (!userRole) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' }, requestId },
        { status: 404 }
      )
    }

    // Verificar que el rol coincida con el flujo de autenticación esperado
    const isValidRole = expectedRole === 'customer' 
      ? CUSTOMER_ROLES.includes(userRole)
      : COMPANY_MEMBER_ROLES.includes(userRole)

    if (!isValidRole) {
      return NextResponse.json(
        { 
          error: { 
            code: 'ROLE_MISMATCH', 
            message: expectedRole === 'customer'
              ? 'Estas credenciales no corresponden a un cliente. Utiliza el flujo de administrador.'
              : 'Estas credenciales no corresponden a un miembro de la empresa. Utiliza el flujo de cliente.'
          } 
        }, 
        { status: 403 }
      )
    }

    const result = await signIn(
      { email, password },
      request.headers
    )

    return NextResponse.json({
      user: result.user,
      session: {
        token: result.token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
      redirect: result.redirect,
    })
  } catch (error: any) {
    if (error.message?.includes('Invalid')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Credenciales incorrectas' }, requestId },
        { status: 401 }
      )
    }
    return handleApiError(error, requestId)
  }
}
```

### 2. Lógica de Mapeo de Identidades a Flujos

#### Crear un servicio de resolución de roles

**Nuevo archivo:** `apps/api/src/shared/auth/role-resolver.ts`

```typescript
import { getPlatformDb, getTenantDb } from '@/shared/db'
import { platformUsers, platformMemberships } from '@/shared/db/schema/platform-schema'
import { users, userRoles, roles } from '@/shared/db/schema/identity'
import { eq, and } from 'drizzle-orm'

export type UserRole = 'owner' | 'admin' | 'app' | 'reception' | 'barber' | 'inventory_manager' | 'accountant' | 'customer'

export const ROLE_CATEGORIES = {
  company_member: ['owner', 'admin', 'app', 'reception', 'barber', 'inventory_manager', 'accountant'],
  customer: ['customer'],
} as const

export type RoleCategory = keyof typeof ROLE_CATEGORIES

export function getRoleCategory(role: string): RoleCategory | null {
  for (const [category, roles] of Object.entries(ROLE_CATEGORIES)) {
    if (roles.includes(role as any)) {
      return category as RoleCategory
    }
  }
  return null
}

export async function resolveUserRole(
  email: string,
  tenantId?: string
): Promise<{ role: string | null; category: RoleCategory | null; platformUserId?: string; localUserId?: string }> {
  const platformDb = getPlatformDb()

  // Buscar en platform DB
  const [platformUser] = await platformDb
    .select({
      userId: platformUsers.id,
      membershipRole: platformMemberships.role,
    })
    .from(platformUsers)
    .innerJoin(platformMemberships, eq(platformMemberships.userId, platformUsers.id))
    .where(eq(platformUsers.email, email))
    .limit(1)

  if (platformUser) {
    const category = getRoleCategory(platformUser.membershipRole)
    return {
      role: platformUser.membershipRole,
      category,
      platformUserId: platformUser.userId,
    }
  }

  // Buscar en tenant DB si se proporciona tenantId
  if (tenantId) {
    const tenantDb = getTenantDb()
    const [localUser] = await tenantDb
      .select({
        userId: users.id,
        roleName: roles.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.email, email))
      .limit(1)

    if (localUser && localUser.roleName) {
      const category = getRoleCategory(localUser.roleName)
      return {
        role: localUser.roleName,
        category,
        localUserId: localUser.userId,
      }
    }
  }

  return { role: null, category: null }
}

export function validateRoleForFlow(
  userRole: string | null,
  expectedFlow: 'company_member' | 'customer'
): boolean {
  if (!userRole) return false
  return ROLE_CATEGORIES[expectedFlow].includes(userRole as any)
}
```

#### Actualizar el tenant-context.ts para usar el nuevo resolvedor

**Archivo:** `apps/api/src/shared/tenancy/tenant-context.ts`

```typescript
// Agregar al imports
import { resolveUserRole, getRoleCategory, type RoleCategory } from '@/shared/auth/role-resolver'

// Modificar la función resolveIdentity para incluir validación de flujo
async function resolveIdentity(
  headers: Headers,
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>,
  requestedTenantId: string,
  expectedFlow?: 'company_member' | 'customer'
): Promise<ResolvedIdentity | null> {
  // ... código existente hasta la consulta de platform DB ...

  // Validar rol si se especifica un flujo esperado
  if (expectedFlow) {
    const identity = await resolveUserRole(session.user.email, requestedTenantId)
    if (!identity.role || !validateRoleForFlow(identity.role, expectedFlow)) {
      return null
    }
  }

  // ... resto del código existente ...
}
```

### 3. Mensajes de Error Recomendados

#### Para el frontend (Angular):

```typescript
// apps/web/src/app/core/auth/auth.service.ts
export const ROLE_ERROR_MESSAGES: Record<string, string> = {
  ROLE_MISMATCH: 'Estas credenciales no corresponden a este tipo de usuario',
  CUSTOMER_TO_ADMIN: 'Utiliza el flujo de administrador para acceder con estas credenciales',
  ADMIN_TO_CUSTOMER: 'Utiliza el flujo de cliente para acceder con estas credenciales',
  USER_NOT_FOUND: 'Usuario no encontrado',
  UNAUTHORIZED: 'Credenciales incorrectas',
}

export function getRoleErrorMessage(code: string, userRole?: string): string {
  const baseMessage = ROLE_ERROR_MESSAGES[code] || 'Error de autenticación'
  
  if (code === 'ROLE_MISMATCH' && userRole) {
    const category = getRoleCategory(userRole)
    if (category === 'customer') {
      return 'Estas credenciales son de cliente. Utiliza el flujo de cliente.'
    }
    return 'Estas credenciales son de miembro de la empresa. Utiliza el flujo de administrador.'
  }
  
  return baseMessage
}
```

#### Para el backend:

```typescript
// Estructura de error estandarizada
const roleErrors = {
  ROLE_MISMATCH_CUSTOMER: {
    code: 'ROLE_MISMATCH',
    message: 'Credenciales de cliente no válidas para este flujo',
    details: 'Use el flujo de autenticación de cliente',
    httpStatus: 403,
  },
  ROLE_MISMATCH_ADMIN: {
    code: 'ROLE_MISMATCH',
    message: 'Credenciales de administrador no válidas para este flujo',
    details: 'Use el flujo de autenticación de administrador',
    httpStatus: 403,
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'Usuario no encontrado',
    httpStatus: 404,
  },
}
```

### 4. Buenas Prácticas para RBAC

#### 4.1. Principio de Menos Privilegios

```typescript
// apps/api/src/shared/tenancy/request-context.ts
export function hasPermission(permission: string, userRole: string): boolean {
  // Actualizar la tabla de permisos para ser más estricta
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
      'customers:read', // Los clientes pueden ver su propia información
    ],
  }

  const permissions = rolePermissions[userRole]
  if (!permissions) return false
  if (permissions.includes('*')) return true
  return permissions.includes(permission)
}
```

#### 4.2. Rate Limiting para Intentos de Login

```typescript
// apps/api/src/shared/middleware/rate-limit.ts
import { LRUCache } from 'lru-cache'

const loginAttempts = new LRUCache<string, number>({
  max: 1000,
  ttl: 1000 * 60 * 15 // 15 minutos
})

export function checkLoginRateLimit(email: string): boolean {
  const attempts = loginAttempts.get(email) || 0
  if (attempts >= 5) {
    return false // Bloqueado
  }
  loginAttempts.set(email, attempts + 1)
  return true
}

export function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email)
}
```

#### 4.3. Auditoría de Intentos de Acceso

```typescript
// apps/api/src/shared/audit/audit-service.ts
export interface AuditEvent {
  timestamp: string
  email: string
  action: 'login_success' | 'login_failure' | 'role_mismatch' | 'permission_denied'
  role?: string
  expectedFlow?: string
  ipAddress: string
  userAgent: string
  details?: string
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  // Guardar en tabla de auditoría
  const db = getTenantDb()
  await db.insert(auditEvents).values({
    tenantId: getTenantId(),
    action: event.action,
    resource: 'auth',
    result: event.action === 'login_success' ? 'success' : 'failure',
    ipAddress: event.ipAddress,
    userAgent: event.userAgent,
    createdAt: event.timestamp,
    metadata: JSON.stringify({
      email: event.email,
      role: event.role,
      expectedFlow: event.expectedFlow,
      details: event.details,
    }),
  })
}
```

#### 4.4. Validación de Sesión en Cada Solicitud

```typescript
// apps/api/src/shared/middleware/auth-middleware.ts
export async function requireRole(requiredRole: string) {
  return async (request: NextRequest, callback: () => Promise<Response>) => {
    const context = getRequestContext()
    
    if (context.userRole !== requiredRole && !hasPermission('*', context.userRole)) {
      await logAuditEvent({
        timestamp: new Date().toISOString(),
        email: context.userId,
        action: 'permission_denied',
        role: context.userRole,
        ipAddress: context.ipAddress || '',
        userAgent: context.userAgent || '',
        details: `Required role: ${requiredRole}`,
      })
      
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Permiso denegado' } },
        { status: 403 }
      )
    }
    
    return callback()
  }
}
```

#### 4.5. Frontend - Guard de Rutas por Rol

```typescript
// apps/web/src/app/core/auth/auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private tenantService: TenantService
  ) {}

  canActivate(route:ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['role']
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'])
      return false
    }

    if (expectedRole && this.authService.user()?.role !== expectedRole) {
      this.router.navigate(['/access-denied'])
      return false
    }

    return true
  }
}
```

#### 4.6. Configuración de Rutas con Roles

```typescript
// apps/web/src/app/app.routes.ts
{
  path: 'customer',
  component: CustomerLayoutComponent,
  data: { role: 'customer', flow: 'customer' },
  children: [
    { path: 'book', component: BookingComponent },
    { path: 'appointments', component: CustomerAppointmentsComponent },
  ]
},
{
  path: 'admin',
  component: AdminLayoutComponent,
  data: { role: 'admin', flow: 'company_member' },
  children: [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'agenda', component: AgendaComponent },
    // ... otras rutas de admin
  ]
}
```

### 5. Resumen de Implementación

| Archivo | Cambio | Propósito |
|---------|--------|-----------|
| `login/route.ts` | Agregar validación de rol | Verificar que el usuario tenga el rol esperado |
| `role-resolver.ts` | Nuevo archivo | Centralizar lógica de resolución de roles |
| `tenant-context.ts` | Actualizar `resolveIdentity` | Integrar validación de flujo |
| `auth.service.ts` (frontend) | Agregar manejo de errores | Mostrar mensajes apropiados |
| `auth.guard.ts` | Actualizar con validación de rol | Proteger rutas por rol |
| `app.routes.ts` | Actualizar con `data.role` | Definir flujos de autenticación |
| `request-context.ts` | Actualizar `hasPermission` | Refinar tabla de permisos |

Esta estrategia garantiza que:
- Un "Company Member" no pueda acceder por el flujo de "Customer"
- Un "Customer" no pueda acceder por el flujo de "Company Member"
- Los errores se manejan de manera segura sin revelar información sensible
- Todas las activities son auditadas
- El rate limiting protege contra fuerza bruta