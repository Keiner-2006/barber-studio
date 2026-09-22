# Plan técnico: autenticación con Google/Supabase y Cloudinary

## 1. Contexto y decisión arquitectónica

La plataforma tiene dos tipos de usuarios:

1. **Usuario de la plataforma:** propietario, administrador, recepción o personal que opera uno o varios negocios.
2. **Cliente final del negocio:** persona registrada por una barbería para historial, reservas y comunicación.

No deben mezclarse ambos conceptos. Un usuario autenticado en la plataforma pertenece a la cuenta SaaS; los clientes finales pertenecen al `tenant_id` de una barbería.

### Advertencia sobre la arquitectura actual

La aplicación actualmente tiene Neon + Drizzle + Better Auth. Supabase Auth y Better Auth no deben ejecutarse simultáneamente para los mismos usuarios sin una estrategia explícita de migración. Hay dos alternativas:

- **Opción A — recomendada si se quiere Supabase Auth:** migrar la autenticación a Supabase Auth y mantener Neon únicamente para datos, validando el JWT de Supabase en Next.js.
- **Opción B — conservar la arquitectura actual:** mantener Better Auth para email/password y añadir Google OAuth dentro de Better Auth. En este caso no se usa Supabase Auth.

Este documento especifica la **Opción A**, porque se solicitó autenticación con Google mediante Supabase. Antes de implementarla en producción se debe aprobar la migración de sesiones y usuarios.

---

## 2. Flujo de autenticación con Google

### Flujo del usuario

1. El usuario entra en `/` y pulsa `Crear mi negocio` o `Iniciar sesión`.
2. En `/auth/login` puede:
   - Continuar con Google.
   - Usar email y contraseña, si se habilita también ese método.
3. Supabase redirige a Google.
4. Google vuelve a `/auth/callback?code=...`.
5. El callback intercambia el código por una sesión segura.
6. Next.js redirige a:
   - `/registrar-negocio` si el usuario no tiene negocio.
   - `/app` si ya tiene una membresía activa.
7. El servidor obtiene el usuario desde Supabase; nunca se debe confiar en un `userId` enviado por el navegador.

### URLs necesarias

Configurar en Supabase Auth:

- Desarrollo: `http://localhost:3000/auth/callback`
- Preview: la URL exacta del deployment de Vercel + `/auth/callback`
- Producción: `https://app.dominio.com/auth/callback`

En Google Cloud Console configurar el redirect URI entregado por Supabase, normalmente:

```text
https://<project-ref>.supabase.co/auth/v1/callback
```

Nunca colocar el `client_secret` de Google en Angular ni en variables `NEXT_PUBLIC_*`.

---

## 3. Variables de entorno

### Frontend Angular

```env
NG_APP_SUPABASE_URL=https://<project-ref>.supabase.co
NG_APP_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NG_APP_API_URL=https://api.dominio.com
```

La publishable key puede vivir en el cliente porque RLS debe proteger los datos. La clave secreta o `service_role` nunca puede exponerse.

### Backend Next.js

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<server-only-secret-key>

CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<server-only-api-secret>
CLOUDINARY_UPLOAD_FOLDER=barber-platform/tenants
```

Si se mantiene Neon como base de datos:

```env
DATABASE_URL=<neon-connection-string>
```

Reglas:

- `SUPABASE_SECRET_KEY`, `CLOUDINARY_API_SECRET` y `DATABASE_URL` solo se leen en servidor.
- No usar `NEXT_PUBLIC_SUPABASE_SECRET_KEY`.
- Validar variables al iniciar el backend y fallar con un mensaje claro si falta una variable obligatoria.
- En Angular, usar el mecanismo de configuración de entorno del build y no commitear secretos.

---

## 4. Paquetes

### Angular

```bash
pnpm add @supabase/supabase-js
```

### Next.js

```bash
pnpm add @supabase/ssr cloudinary zod
```

No instalar SDK de Google directamente. Supabase administra el intercambio OAuth.

---

## 5. Cliente Supabase en Angular

Crear `src/app/core/auth/supabase.client.ts`:

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const supabase: SupabaseClient = createClient(
  import.meta.env.NG_APP_SUPABASE_URL,
  import.meta.env.NG_APP_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
```

Para Angular CLI, sustituir `import.meta.env` por `environment.supabaseUrl` y `environment.supabasePublishableKey` según la configuración existente del proyecto.

Servicio de autenticación:

```ts
import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  async signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async getSession() {
    return supabase.auth.getSession();
  }

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  }

  async signOut() {
    return supabase.auth.signOut();
  }
}
```

El botón debe ser accesible:

```html
<button type="button" (click)="auth.signInWithGoogle()">
  Continuar con Google
</button>
```

No crear sesiones manuales ni guardar tokens en `localStorage`.

---

## 6. Callback en Next.js

La ruta debe vivir en:

```text
app/auth/callback/route.ts
```

Ejemplo con `@supabase/ssr`:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/app';

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth', url.origin));
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL(next, url.origin));
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=oauth', url.origin));
  }

  return response;
}
```

En la versión final se debe validar `next` contra una lista de rutas internas para evitar open redirects.

---

## 7. Protección de rutas y autorización

Crear un middleware/proxy que refresque la sesión y proteja `/app`, `/registrar-negocio` y las APIs privadas. El middleware solo es una primera barrera; cada handler debe validar sesión nuevamente.

Patrón de servidor:

```ts
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Después de obtener el usuario:

1. Buscar sus membresías en la base central.
2. Resolver el `tenant_id` activo.
3. Verificar que el usuario tiene el rol necesario.
4. Consultar datos filtrando por `tenant_id`.

Nunca aceptar `tenant_id` como autorización por sí solo. El tenant enviado por el cliente debe compararse contra las membresías del usuario.

Roles sugeridos:

- `owner`
- `admin`
- `reception`
- `barber`
- `inventory_manager`
- `accountant`

---

## 8. Esquema de usuarios y negocios

Si se migra a Supabase Auth, `auth.users` es la fuente de identidad. En el esquema de aplicación crear:

```sql
create table public.platform_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'reception', 'barber', 'inventory_manager', 'accountant')),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);
```

Los clientes finales de cada barbería deben estar separados:

```sql
create table public.tenant_customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

El cliente final no necesita una cuenta Supabase al principio. Puede crearse desde recepción y después convertirse en usuario si se habilita un portal de reservas.

### RLS mínimo

```sql
alter table public.platform_memberships enable row level security;
alter table public.tenant_customers enable row level security;

create policy "users read own memberships"
on public.platform_memberships
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "members read tenant customers"
on public.tenant_customers
for select to authenticated
using (
  exists (
    select 1
    from public.platform_memberships m
    where m.user_id = (select auth.uid())
      and m.tenant_id = tenant_customers.tenant_id
      and m.status = 'active'
  )
);
```

Las políticas de `insert`, `update` y `delete` deben restringirse por rol. No usar `user_metadata` para autorización; usar tablas de membresía o `app_metadata` administrado por servidor.

---

## 9. Cloudinary para logos y fotografías

Cloudinary debe almacenar únicamente assets de marca del negocio:

- Logo.
- Foto de portada.
- Galería de la barbería.
- Fotos opcionales de barberos o servicios.

No guardar imágenes como base64 en PostgreSQL. Guardar solamente:

- `public_id`.
- `secure_url`.
- `resource_type`.
- `width` y `height`.
- `format`.
- `bytes`.
- `alt_text`.
- `tenant_id`.
- `created_by`.

### Convención de carpetas

```text
barber-platform/tenants/{tenantId}/branding/logo/{assetId}
barber-platform/tenants/{tenantId}/branding/cover/{assetId}
barber-platform/tenants/{tenantId}/gallery/{assetId}
```

No permitir que el navegador elija libremente el `public_id`.

---

## 10. Upload seguro recomendado

Usar una de estas opciones:

### Opción preferida: upload firmado desde Next.js

1. Angular solicita `POST /api/media/signature`.
2. Next.js valida la sesión y la membresía del tenant.
3. Next.js genera una firma Cloudinary con carpeta fija y timestamp.
4. Angular sube directamente a Cloudinary.
5. Angular envía el resultado a `POST /api/media/assets`.
6. Next.js valida que el `public_id`, carpeta y tenant coincidan antes de guardar el asset.

Código de servidor:

```ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function createBrandingSignature(tenantId: string, assetId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `barber-platform/tenants/${tenantId}/branding`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, public_id: assetId },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    signature,
    folder,
    publicId: assetId,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}
```

Código de cliente simplificado:

```ts
const formData = new FormData();
formData.append('file', file);
formData.append('api_key', signature.apiKey);
formData.append('timestamp', String(signature.timestamp));
formData.append('signature', signature.signature);
formData.append('folder', signature.folder);
formData.append('public_id', signature.publicId);

await fetch(
  `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
  { method: 'POST', body: formData },
);
```

### Validaciones obligatorias

- Aceptar `image/jpeg`, `image/png` y `image/webp`.
- Límite recomendado de 5 MB para logo y 10 MB para portada.
- Validar MIME y extensión en cliente y servidor.
- Redimensionar con transformaciones de Cloudinary.
- Rechazar SVG inicialmente salvo que se sanitice rigurosamente.
- Generar `alt_text` obligatorio para imágenes no decorativas.
- No confiar en el `content-type` enviado por el navegador.
- Eliminar el asset anterior solo después de guardar correctamente el nuevo.

---

## 11. Tabla de assets

```sql
create table public.tenant_assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.platform_tenants(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id),
  kind text not null check (kind in ('logo', 'cover', 'gallery', 'staff', 'service')),
  public_id text not null unique,
  secure_url text not null,
  width integer,
  height integer,
  format text,
  bytes integer,
  alt_text text not null,
  created_at timestamptz not null default now()
);
```

El branding del tenant debe referenciar los assets:

```sql
alter table public.tenant_branding
  add column if not exists logo_asset_id uuid references public.tenant_assets(id),
  add column if not exists cover_asset_id uuid references public.tenant_assets(id),
  add column if not exists primary_color text not null default '#151515',
  add column if not exists secondary_color text,
  add column if not exists description text;
```

---

## 12. Colores y personalización

El usuario puede elegir color primario y secundario, pero no debe controlar CSS arbitrario. Guardar valores HEX validados y derivar tokens en frontend.

Reglas:

- Validar formato `#RRGGBB`.
- Calcular contraste contra texto claro y oscuro.
- Mostrar advertencia si el contraste no alcanza WCAG AA.
- No permitir que el color elegido reemplace estados semánticos como error, éxito o advertencia.
- Mantener una paleta neutra de la plataforma y aplicar branding solo en CTA, enlaces, botones y detalles de la página pública.
- Si no se configura color, usar el tema premium por defecto de Navaja.

Ejemplo de tokens:

```ts
export function getBrandTokens(primary: string, secondary?: string) {
  return {
    '--brand-primary': primary,
    '--brand-secondary': secondary ?? primary,
    '--brand-on-primary': getReadableForeground(primary),
  } as Record<string, string>;
}
```

No construir estilos con interpolación sin validar el valor. El branding debe aplicarse mediante variables CSS controladas.

---

## 13. API de medios

### `POST /api/media/signature`

Entrada:

```json
{ "tenantId": "uuid", "kind": "logo", "fileName": "logo.png" }
```

Respuesta:

```json
{
  "cloudName": "...",
  "apiKey": "...",
  "timestamp": 1730000000,
  "signature": "...",
  "folder": "barber-platform/tenants/.../branding",
  "publicId": "..."
}
```

### `POST /api/media/assets`

Guarda los metadatos del upload después de verificar la membresía y el path Cloudinary.

### `DELETE /api/media/assets/:id`

1. Verifica rol `owner` o `admin`.
2. Elimina el registro de base de datos.
3. Solicita destrucción del `public_id` a Cloudinary.
4. Registra auditoría.

### `GET /api/public/tenants/:slug/branding`

Endpoint público que devuelve únicamente branding publicado, nunca información privada ni secretos.

---

## 14. Migración desde Better Auth

Si existen usuarios actuales:

1. Exportar únicamente IDs, emails, nombres y fechas; nunca exponer hashes en logs.
2. Crear usuarios equivalentes en Supabase Auth mediante una operación administrativa server-only.
3. Forzar recuperación de contraseña o pedir primer acceso con Google.
4. Crear mapeo `legacy_user_id` → `auth.users.id`.
5. Migrar memberships y ownership.
6. Cambiar el frontend al cliente Supabase.
7. Cambiar los guards del backend para validar JWT de Supabase.
8. Mantener Better Auth temporalmente solo durante la ventana de migración.
9. Revocar sesiones antiguas.
10. Eliminar Better Auth cuando no existan consumidores.

No realizar una migración destructiva sin backup y plan de rollback.

---

## 15. Pruebas obligatorias

### Auth

- Login con Google exitoso.
- Rechazo de callback sin `code`.
- Sesión persistente después de recargar.
- Logout elimina la sesión.
- Usuario sin tenant es enviado a registro de negocio.
- Usuario con tenant activo entra al dashboard.
- Un usuario no puede acceder a otro tenant cambiando el ID.
- Redirect `next` no permite dominios externos.

### Cloudinary

- Logo válido sube correctamente.
- Archivo mayor al límite es rechazado.
- MIME no permitido es rechazado.
- Un usuario sin membresía no obtiene firma.
- Un usuario no puede firmar una carpeta de otro tenant.
- El asset guardado pertenece al tenant correcto.
- Reemplazar logo no rompe el branding anterior si el nuevo upload falla.
- La eliminación de imagen requiere rol autorizado.

### RLS y API

- `anon` no lee datos privados.
- `authenticated` solo ve sus memberships.
- Las consultas de clientes filtran por `tenant_id`.
- Las mutaciones validan rol y pertenencia.
- No hay claves secretas en el bundle Angular.

---

## 16. Orden recomendado de implementación

1. Decidir migración Better Auth → Supabase Auth.
2. Configurar Google OAuth en Supabase y URLs de callback.
3. Crear cliente Angular y callback Next.js.
4. Implementar sesión server-side y protección de rutas.
5. Crear memberships y políticas RLS.
6. Implementar `/registrar-negocio` después de autenticarse.
7. Configurar Cloudinary y firma server-side.
8. Crear tabla de assets y endpoint de metadatos.
9. Crear personalización de colores con validación de contraste.
10. Mostrar página pública del negocio con logo y portada.
11. Conectar clientes finales, reservas, inventario y caja al tenant activo.
12. Ejecutar pruebas de autorización, uploads y regresión.

## Criterio de terminado

La funcionalidad está lista cuando un propietario puede entrar con Google, registrar un negocio, crear su primera sucursal, subir logo y portada, elegir colores accesibles, ver su página pública y registrar clientes de su barbería sin que esos clientes tengan acceso a la cuenta administrativa ni a otros tenants.