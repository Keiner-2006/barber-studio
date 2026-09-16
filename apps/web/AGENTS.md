# AGENTS.md — Web App Conventions

## Arquitectura por Feature

Cada feature vive en `src/app/features/<feature>/` y sigue el patrón:

```
<feature>.models.ts   →  interfaces y tipos del dominio
<feature>.api.ts      →  llamadas HTTP (usando ApiClient + ApiResponse)
<feature>.store.ts    →  estado signal + lógica de negocio
<feature>.component.ts →  UI (consumidor del store)
<feature>.routes.ts   →  configuración de rutas con roles
```

### Responsabilidades

- **models**: Define todas las interfaces TypeScript. Importa tipos de `@navaja/shared` cuando existen allí.
- **api**: Métodos HTTP usando `ApiClient`. Retorna `Observable<ApiResponse<T>>`.
- **store**: `@Injectable({ providedIn: 'root' })`. Estado con `signal()`. Lógica asíncrona en métodos. Expondr readonly signals.
- **component**: Consume el store inyectado. No hace lógica de negocio.
- **routes**: Define `Routes` con `canActivate: [AuthGuard]` y `data: { roles: [...] }`.

### Imports

- Tipos compartidos: `import type { ApiResponse } from '@navaja/shared'`
- AuthGuard: `import { AuthGuard } from '../../core/auth/auth.guard'`
- Modelos del feature: `import { X } from './<feature>.models'`

## AuthGuard y Roles

- `AuthGuard` verifica `route.data['roles']`.
- El shell padre en `app.routes.ts` usa `canActivate: [AuthGuard]` con `data: { roles: ['company_member'] }` como guardia por defecto.
- Cada route file de feature agrega su propio `canActivate: [AuthGuard]` con roles específicos.

## Tipos Compartidos (@navaja/shared)

Usar siempre `@navaja/shared` para:
- `ApiResponse<T>`, `ApiError`, `PaginationMeta`
- `Role`, `ROLES`, `ROLE_LABELS`
- DTOs: `LoginDTO`, `RegisterDTO`, `AuthResponseDTO`, etc.

No duplicar tipos que ya existan en `@navaja/shared`.

## Comandos

```bash
pnpm --filter @navaja/web typecheck   # tsc --noEmit
pnpm --filter @navaja/web lint        # ng lint
pnpm --filter @navaja/web start       # dev server
```
