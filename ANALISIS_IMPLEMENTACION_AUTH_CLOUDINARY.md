# Análisis de Viabilidad: Plan de Autenticación Google/Supabase + Cloudinary

**Fecha:** 2026-09-21  
**Proyecto:** Barberia - Barbershop Management System  
**Versión actual:** Better Auth + Drizzle + PostgreSQL (Render)

---

## Resumen Ejecutivo

El plan especifica migrar a **Supabase Auth + Google OAuth** (Opción A). Sin embargo, la arquitectura actual **ya tiene una base sólida con Better Auth** y **no usa Neon** (usa PostgreSQL en Render). 

**Conclusión:** La migración a Supabase Auth es **posible pero compleja y de alto riesgo**. Se recomienda **Opción B: Extender Better Auth con Google OAuth**, que es más seguro, rápido y mantiene la arquitectura existente.

---

## 1. Análisis del Sistema de Autenticación Actual

### Lo que YA existe (Better Auth implementado):

| Componente | Estado | Archivo |
|------------|--------|---------|
| Email/Password login | ✅ Completo | `apps/api/src/shared/auth/config.ts` |
| Registro de usuarios | ✅ Completo | `apps/api/src/app/api/v1/auth/register/route.ts` |
| Gestión de sesiones | ✅ Completo | `apps/api/src/app/api/v1/auth/session/route.ts` |
| Role-based login flow | ✅ Completo | `apps/api/src/app/api/v1/auth/login/route.ts` |
| Role resolver (company_member vs customer) | ✅ Completo | `apps/api/src/shared/auth/role-resolver.ts` |
| Tenant resolution con cache | ✅ Completo | `apps/api/src/shared/tenancy/tenant-context.ts` |
| Auth Guard Angular con roles | ✅ Completo | `apps/web/src/app/core/auth/auth.guard.ts` |
| Login UI con tabs (cliente/staff) | ✅ Completo | `apps/web/src/app/features/auth/login.component.ts` |

### Lo que FALTA del plan:

| Funcionalidad | Estado | Complejidad |
|---------------|--------|-------------|
| **Google OAuth** | ❌ No implementado | Media (añadir a Better Auth) |
| **Supabase Auth** | ❌ No usar (recomendación) | - |

---

## 2. Análisis de Base de Datos

### Esquema Actual (Platform DB)

```sql
-- platform_users: usuarios de la plataforma SaaS
-- platform_tenants: negocios/barberías
-- platform_memberships: relación user-tenant con roles
-- platform_sessions: sesiones Better Auth
```

### Esquema Actual (Tenant DB)

```sql
-- users: usuarios locales del tenant (con platform_user_id)
-- roles/permissions: RBAC granular por tenant
-- customers: clientes finales de la barbería
```

### Comparación con Plan Supabase:

| Tabla Plan | Tabla Actual | Compatibilidad |
|------------|--------------|----------------|
| `auth.users` (Supabase) | `platform_users` | **Diferente** - migración requerida |
| `platform_memberships` | `platform_memberships` | ✅ **Idéntica** |
| `tenant_customers` | `customers` (tenant DB) | ✅ **Compatible** |
| `tenant_assets` | `tenant_media_assets` | ✅ **Compatible** |
| `tenant_branding` | `tenant_branding` | ✅ **Idéntica** |

**Hallazgo clave:** El esquema actual **ya soporta** la arquitectura multi-tenant propuesta. Solo falta Google OAuth.

---

## 3. Análisis de Cloudinary

### Estado Actual: ✅ **YA INTEGRADO**

```typescript
// apps/api/src/app/api/v1/media/signature/route.ts
// Usa upload_preset + API key (no firmas firmadas)
```

| Funcionalidad | Plan | Actual | Gap |
|---------------|------|--------|-----|
| Upload directo a Cloudinary | Firmas firmadas | Upload preset | **Menor** |
| Validación tenant/carpeta | Obligatoria | Parcial (folder fijo) | **Medio** |
| Tabla assets | `tenant_assets` | `tenant_media_assets` | ✅ Existe |
| Branding público | `GET /public/tenants/:slug/branding` | `GET /public/businesses/:slug` | ✅ Existe |

**Recomendación:** Migrar de `upload_preset` a **firmas firmadas server-side** para mayor seguridad (validar tenant_id en la firma).

---

## 4. Análisis Frontend (Angular)

### Estado Actual: ✅ **Arquitectura lista para Google OAuth**

| Componente | Estado | Notas |
|------------|--------|-------|
| `AuthService` | ✅ Completo | Signals, storage, interceptors |
| `AuthGuard` | ✅ Completo | Roles: `company_member`, `customer`, roles específicos |
| `LoginComponent` | ✅ Completo | Tabs: "Acceso Clientes" / "Equipo / Studio OS" |
| Botones SSO | 🔴 **UI only** | `● Google` y `● Apple` no funcionales |
| Onboarding flow | ✅ Completo | 6 pasos: Cuenta → Identidad → Ubicación → Servicios → Marca → Activación |
| Branding step | ✅ Completo | Color presets + upload zone (Cloudinary) |

### Lo que necesita cambio para Google OAuth:

1. **AuthService**: Añadir `signInWithGoogle()` que llame a `/auth/google` endpoint
2. **LoginComponent**: Conectar botón Google a `AuthService.signInWithGoogle()`
3. **Backend**: Añadir ruta `/auth/google` en Better Auth

---

## 5. Evaluación de Riesgos: Opción A vs Opción B

### ❌ OPCIÓN A: Migrar a Supabase Auth (Plan actual)

| Riesgo | Impacto | Probabilidad |
|--------|---------|--------------|
| Migración de usuarios/hashes | **Crítico** - pérdida de acceso | Alta |
| Sesiones activas rotas | **Crítico** - todos logouts forzados | Alta |
| Cambio JWT validation en middleware | **Alto** - refactor auth flow | Media |
| RLS policies en Supabase | **Medio** - nuevo paradigma | Media |
| Sincronización `auth.users` ↔ `platform_users` | **Alto** - dual write | Alta |
| Testing completo de auth | **Alto** - semanas | Cierta |
| Rollback plan complejo | **Crítico** | Media |

**Tiempo estimado:** 3-6 semanas + testing

### ✅ OPCIÓN B: Extender Better Auth con Google OAuth (Recomendada)

| Ventaja | Detalle |
|---------|---------|
| **Cero migración** | Usuarios existentes siguen funcionando |
| **Mismo JWT/sesiones** | No rompe middleware, guards, interceptors |
| **Better Auth soporta OAuth nativo** | `plugins: [google(), github(), ...]` |
| **Menos código** | ~50 líneas vs reescribir auth completo |
| **Rollback trivial** | Quitar plugin OAuth |
| **Mantenimiento** | Un solo sistema de auth |

**Tiempo estimado:** 2-3 días

---

## 6. Implementación Recomendada (Opción B)

### 6.1 Backend: Añadir Google OAuth a Better Auth

```typescript
// apps/api/src/shared/auth/config.ts
import { google } from 'better-auth/plugins'

const auth = betterAuth({
  // ...config existente
  plugins: [
    bearer(),
    google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
})
```

### 6.2 Variables de Entorno

```env
# Backend (.env.local)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
BETTER_AUTH_URL=https://barber-studio-1ook.onrender.com
```

### 6.3 Endpoints OAuth (automáticos con Better Auth)

| Ruta | Descripción |
|------|-------------|
| `GET /api/auth/google` | Inicia OAuth flow |
| `GET /api/auth/callback/google` | Callback de Google |

### 6.4 Frontend: Conectar botón Google

```typescript
// apps/web/src/app/core/auth/auth.service.ts
async signInWithGoogle(): Promise<void> {
  window.location.href = `${environment.apiUrl}/auth/google`
}
```

```html
<!-- login.component.ts -->
<button type="button" (click)="signInWithGoogle()" class="sso-btn">
  <span class="material-icons">g_mobiledata</span> Continuar con Google
</button>
```

### 6.5 Cloudinary: Firmas Firmadas (Mejora de Seguridad)

```typescript
// apps/api/src/app/api/v1/media/signature/route.ts
// Cambiar de upload_preset a firma firmada con validación de tenant
```

---

## 7. Plan de Acción Detallado

### Fase 1: Google OAuth con Better Auth (2-3 días)

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 1. Instalar plugin Google | `package.json` | 15 min |
| 2. Configurar Google Cloud Console | - | 30 min |
| 3. Añadir plugin a Better Auth | `auth/config.ts` | 30 min |
| 4. Variables de entorno | `.env.local`, `.env.example` | 15 min |
| 5. Frontend: AuthService.signInWithGoogle | `auth.service.ts` | 1 hora |
| 6. Frontend: LoginComponent botón Google | `login.component.ts` | 30 min |
| 7. Testing E2E login Google | - | 1 día |

### Fase 2: Cloudinary Firmas Firmadas (1-2 días)

| Tarea | Archivo | Esfuerzo |
|-------|---------|----------|
| 1. Cambiar signature route a firmas | `media/signature/route.ts` | 2 horas |
| 2. Validar tenant_id en firma | `media/signature/route.ts` | 1 hora |
| 3. Frontend: upload directo a Cloudinary | `onboarding-step-branding.component.ts` | 2 horas |
| 4. Testing uploads | - | 4 horas |

### Fase 3: Validación y Pulido (1 día)

- Pruebas de flujo completo: Google OAuth → Onboarding → Branding
- Verificar roles y guards
- Documentar variables de entorno

---

## 8. Conclusiones y Recomendación Final

### ✅ **NO MIGRAR A SUPABASE AUTH**

Razones:
1. **Arquitectura actual es robusta** y ya implementa todo el RBAC multi-tenant
2. **Better Auth soporta OAuth nativamente** (Google, GitHub, Apple, etc.)
3. **Migración a Supabase = reescribir auth completo** con riesgo crítico
4. **Cloudinary ya integrado** - solo necesita firmas firmadas
5. **Frontend listo** - solo conectar botones SSO

### 🎯 **IMPLEMENTAR OPCIÓN B: Better Auth + Google OAuth**

- **Tiempo:** ~3-4 días vs 3-6 semanas
- **Riesgo:** Bajo vs Crítico
- **Mantenimiento:** Un sistema vs dos sistemas
- **Compatibilidad:** 100% con código existente

### 📋 Próximos Pasos

1. **Aprobar Opción B** con stakeholders
2. **Crear credenciales Google OAuth** en Google Cloud Console
3. **Implementar Fase 1** (Google OAuth)
4. **Implementar Fase 2** (Cloudinary firmas firmadas)
5. **Validar en staging** antes de producción

---

## Apéndice: Archivos a Modificar

### Backend
- `apps/api/package.json` - añadir `@better-auth/plugin-google` (o usar built-in)
- `apps/api/src/shared/auth/config.ts` - añadir plugin Google
- `apps/api/.env.local` - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `apps/api/.env.example` - documentar nuevas variables
- `apps/api/src/app/api/v1/media/signature/route.ts` - firmas firmadas

### Frontend
- `apps/web/src/app/core/auth/auth.service.ts` - `signInWithGoogle()`
- `apps/web/src/app/features/auth/login.component.ts` - conectar botón Google
- `apps/web/src/environments/environment.ts` - si se necesita config extra

### Shared
- `packages/shared/src/dtos/auth.dto.ts` - si se añaden tipos OAuth