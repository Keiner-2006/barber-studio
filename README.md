# Navaja Studio OS

Sistema de gestión para barberías con reservas, agenda, clientes, catálogo, inventario, compras, caja y reportes.

El proyecto está organizado como un monorepo con frontend Angular, backend Next.js, PostgreSQL y un paquete compartido de contratos.

## Índice

- [Resumen](#resumen)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Multitenancy](#multitenancy)
- [Flujo de una petición](#flujo-de-una-petición)
- [Usuarios, membresías y permisos](#usuarios-membresías-y-permisos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Módulos funcionales](#módulos-funcionales)
- [Base de datos](#base-de-datos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Migraciones y datos demo](#migraciones-y-datos-demo)
- [Pruebas realizadas](#pruebas-realizadas)
- [Estado actual y pendientes](#estado-actual-y-pendientes)

## Resumen

Navaja Studio OS separa la experiencia pública de la operación interna de una barbería:

- **Landing pública:** presentación del estudio, servicios, barberos y reserva.
- **Portal de acceso:** inicio de sesión para clientes y equipo.
- **Backoffice:** dashboard, agenda, clientes, catálogo, inventario, compras, caja, reportes y configuración.
- **API:** reglas de negocio, autorización, aislamiento por empresa y acceso a PostgreSQL.

El tenant demo configurado actualmente es `navaja-demo`.

## Tecnologías

### Monorepo

- **pnpm workspaces:** administra aplicaciones y paquetes dentro del mismo repositorio.
- **TypeScript:** tipado estático compartido entre frontend y backend.
- **`@navaja/shared`:** DTOs, enums y tipos comunes.

### Frontend

- **Angular:** aplicación web principal y sistema de rutas.
- **Standalone components:** componentes independientes sin módulos Angular tradicionales.
- **Lazy loading:** landing, login y módulos del backoffice se cargan bajo demanda.
- **Angular Router:** navegación pública y protegida.
- **Signals:** estado local de autenticación y UI.
- **SCSS:** estilos, variables de diseño y responsive layout.
- **Angular Material:** infraestructura base de componentes y accesibilidad.

### Backend

- **Next.js:** servidor de API mediante Route Handlers.
- **Better Auth:** autenticación y sesiones en modo real; el proyecto también tiene un modo demo de desarrollo.
- **Drizzle ORM:** schemas TypeScript, consultas parametrizadas y migraciones PostgreSQL.
- **Zod:** validación de cuerpos, parámetros y reglas de entrada.
- **Node PostgreSQL (`pg`):** pools y conexiones a PostgreSQL.
- **Clean/Hexagonal por módulos:** dominio, aplicación, infraestructura y presentación.

### Persistencia

- **PostgreSQL:** base relacional principal.
- **Drizzle Kit:** generación y ejecución de migraciones.
- **UUID:** identificadores de entidades.
- **`timestamptz`:** fechas almacenadas en UTC.
- **`numeric`:** importes monetarios sin usar `float`.

## Arquitectura

El sistema usa un monorepo, pero frontend y backend son aplicaciones separadas:

```text
Angular Web  --->  Next.js API  --->  PostgreSQL
     |                 |                 |
     |                 |                 +-- platform_* y tablas operativas
     |                 +-- auth, tenancy, permisos, casos de uso
     +-- rutas, guards, componentes y estado
```

### Backend por módulos

```text
apps/api/src/
├── app/api/v1/                 # Route Handlers HTTP delgados
├── modules/
│   ├── identity/
│   ├── tenants/
│   ├── branches/
│   ├── catalog/
│   ├── customers/
│   ├── appointments/
│   ├── inventory/
│   ├── purchasing/
│   ├── cash/
│   └── reports/
└── shared/
    ├── auth/
    ├── db/
    ├── errors/
    ├── pagination/
    └── tenancy/
```

Cada módulo puede organizarse en:

- `domain/`: entidades y reglas propias del negocio.
- `application/`: casos de uso y contratos.
- `infrastructure/`: repositorios, ORM y proveedores externos.
- `presentation/`: schemas, mappers y validación HTTP.

Las rutas no deberían contener SQL ni decidir reglas complejas. Su responsabilidad es traducir HTTP, validar entrada y llamar al caso de uso o repositorio correspondiente.

## Multitenancy

### Modelo implementado actualmente

El MVP usa:

```text
Un servidor PostgreSQL
Una base de datos compartida
Varios tenants dentro de esa base
tenant_id en las tablas operativas
Membresías para autorizar usuarios
Roles y permisos dentro de cada tenant
```

No se usa actualmente una base física diferente para cada empresa.

Las tablas operativas tienen `tenant_id`, incluyendo clientes, sucursales, usuarios, catálogo, citas, inventario, caja, compras, promociones y auditoría.

### Tenant

Un **tenant** representa una empresa o barbería independiente dentro de la plataforma.

La empresa se registra en:

```text
platform_tenants
```

Cada tenant tiene:

- `id`
- nombre legal y comercial
- `slug`
- estado
- país, zona horaria y moneda
- metadatos de base de datos

### Membership

Una **membership** es la relación que indica que un usuario pertenece a una empresa.

Se almacena en:

```text
platform_memberships
```

Conceptualmente responde:

```text
¿Este usuario puede entrar a esta empresa?
```

La API exige que la membership exista y esté activa antes de ejecutar una operación tenant.

### `tenant_id` en las tablas

El `tenant_id` se asigna desde el contexto seguro de la petición. No debe tomarse como autoridad desde el body enviado por el frontend.

Ejemplo de consulta aislada:

```sql
SELECT *
FROM customers
WHERE tenant_id = :tenantId;
```

Ejemplo de escritura:

```sql
INSERT INTO customers (..., tenant_id)
VALUES (..., :tenantIdFromRequestContext);
```

El repositorio agrega el tenant automáticamente y filtra lecturas, actualizaciones y búsquedas por ese valor.

### `withTenantRequest`

Todas las rutas protegidas deben usar:

```ts
await withTenantRequest(request.headers, async ({ context }) => {
  // Aquí existe un tenant validado.
  // Los repositorios pueden obtener context.tenantId.
  return NextResponse.json(...)
})
```

`withTenantRequest` realiza estas tareas:

1. Lee la sesión.
2. Obtiene el tenant solicitado desde el contexto de la sesión o `x-tenant-id`.
3. Busca el usuario de plataforma por email.
4. Verifica `platform_memberships`.
5. Comprueba que el tenant esté activo.
6. Busca el usuario local del tenant.
7. Resuelve su rol local.
8. Crea un `RequestContext` usando `AsyncLocalStorage`.
9. Ejecuta el callback completo dentro de ese contexto.

Si el usuario no pertenece al tenant solicitado, la API responde `401` y no consulta datos operativos.

## Flujo de una petición

Ejemplo: listar clientes.

```text
1. Angular solicita GET /api/v1/customers
2. Envía Authorization y x-tenant-id
3. Next.js recibe la petición
4. withTenantRequest valida la sesión
5. Busca platform_users por email
6. Busca membership activa para ese tenant_id
7. Resuelve el rol local admin/app
8. Crea RequestContext
9. customerRepository consulta con WHERE tenant_id = context.tenantId
10. PostgreSQL devuelve solo clientes de esa empresa
11. La API responde JSON
12. Angular actualiza la vista
```

El frontend puede ocultar módulos según el rol, pero la seguridad real pertenece al backend.

## Usuarios, membresías y permisos

El modelo separa tres preguntas:

```text
Usuario: ¿quién es?
Membership: ¿a qué empresa pertenece?
Rol/permisos: ¿qué puede hacer allí?
```

### Roles principales

- `owner`: propietario de la empresa en la capa de plataforma.
- `admin`: administración completa dentro del tenant.
- `app`: operación diaria con permisos limitados.
- `reception`: recepción y agenda.
- `barber`: agenda y clientes permitidos.
- `inventory_manager`: inventario y compras.
- `accountant`: caja y reportes.
- `customer`: acceso limitado a sus reservas.

### Permisos

Los permisos siguen el formato:

```text
modulo:accion
```

Ejemplos:

```text
appointments:read
appointments:write
inventory:read
inventory:write
cash:read
cash:write
reports:read
users:write
```

El rol `admin` tiene acceso amplio. El rol `app` se enfoca en operación, agenda, clientes y consultas permitidas.

## Estructura del proyecto

```text
.
├── apps/
│   ├── api/                 # Backend Next.js
│   │   ├── src/app/api/     # Endpoints REST /v1
│   │   ├── src/modules/     # Módulos de negocio
│   │   ├── src/shared/db/   # Drizzle y schemas
│   │   ├── drizzle/         # Migraciones SQL
│   │   └── package.json
│   └── web/                 # Frontend Angular
│       ├── src/app/core/    # Auth, guards e infraestructura
│       ├── src/app/features/# Funcionalidades de negocio
│       ├── src/app/layout/  # Shell público y privado
│       └── package.json
├── packages/
│   └── shared/              # DTOs, enums y tipos compartidos
├── BACKEND.md
├── DATABASE.md
├── FRONTEND.md
├── package.json
└── pnpm-workspace.yaml
```

## Módulos funcionales

### Landing y acceso

- Landing de Navaja Studio.
- Presentación de servicios y barberos.
- Acceso cliente/equipo.
- Login con manejo de errores y estado de carga.

### Identidad y tenancy

- Usuarios de plataforma.
- Usuarios locales por tenant.
- Memberships.
- Roles y permisos.
- Asignación por sucursal.
- Sesiones y auditoría.

### Sucursales

- Alta y consulta de sucursales.
- Horarios y datos de contacto.
- Alcance de usuarios por sucursal.

### Catálogo

- Categorías.
- Servicios.
- Duración y precio.
- Políticas de pago.
- Disponibilidad por sucursal.

### Clientes

- Alta y búsqueda.
- Teléfono y email.
- Preferencias y notas.
- Historial preparado para reservas.

### Agenda

- Citas pendientes y confirmadas.
- Estados: `pending`, `confirmed`, `checked_in`, `in_service`, `completed`, `cancelled`, `no_show`.
- Barbero y servicio asociado.
- Snapshots de precio, duración y nombre.

### Inventario

- Productos y SKU.
- Existencias por sucursal.
- Movimientos de compra, venta, ajuste y consumo.
- Stock mínimo.

### Compras

- Proveedores.
- Órdenes de compra.
- Recepción parcial.
- Costos y movimientos de inventario.

### Caja

- Cajas y sesiones.
- Apertura y cierre.
- Ventas, gastos, reembolsos y ajustes.
- Arqueo y diferencia.

### Reportes y auditoría

- Ventas.
- Ocupación.
- Servicios populares.
- Inventario bajo.
- Caja.
- Eventos de auditoría.

## Base de datos

La base usa PostgreSQL y Drizzle ORM.

Migraciones actuales:

```text
apps/api/drizzle/
├── 0000_concerned_mentor.sql
└── 0001_concerned_switch.sql
```

La migración `0001_concerned_switch.sql` agregó `tenant_id` a las tablas operativas, asignó las filas existentes al tenant demo y luego aplicó `NOT NULL`.

### Convenciones

- UUID para identificadores.
- UTC en almacenamiento.
- `numeric(12,2)` para dinero.
- Soft delete donde corresponde.
- `tenant_id` obligatorio en datos operativos.
- Filtros por tenant en repositorios.
- `branch_id` para alcance de sucursal.
- Transacciones para caja, inventario y reservas.

## Instalación y ejecución

Requisitos:

- Node.js compatible con el proyecto.
- pnpm.
- PostgreSQL accesible.
- Variables de entorno configuradas.

Instalar dependencias:

```bash
pnpm install
```

Ejecutar frontend y backend en paralelo:

```bash
pnpm dev
```

Ejecutar solo API:

```bash
pnpm dev:api
```

Ejecutar solo frontend:

```bash
pnpm dev:web
```

Por defecto:

```text
API:      http://localhost:3000
Frontend: http://localhost:4200
```

Si aparece `EADDRINUSE`, significa que ya existe una instancia usando ese puerto. Se debe reutilizar el servidor existente o detenerlo antes de iniciar otra instancia.

## Variables de entorno

Ejemplo para API:

```env
DATABASE_URL=postgresql://usuario:contraseña@host/base
DATABASE_INTERNAL_URL=postgresql://usuario:contraseña@internal-host/base
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=cambiar-en-produccion
NODE_ENV=development
DEMO_AUTH=true
```

No subir `.env.local` ni contraseñas al repositorio.

`DATABASE_URL` se usa desde desarrollo local. `DATABASE_INTERNAL_URL` queda disponible para despliegues internos dentro del proveedor de infraestructura.

## Migraciones y datos demo

Generar una migración:

```bash
pnpm db:generate
```

Aplicar migraciones:

```bash
pnpm db:migrate
```

Cargar datos realistas del tenant demo:

```bash
pnpm db:seed
```

El seed crea o reutiliza:

- Tenant `navaja-demo`.
- Sucursal `ROMA-NORTE`.
- Usuarios `admin` y `app`.
- Tres barberos.
- Servicios y horarios.
- Clientes.
- Citas confirmadas y pendientes.
- Productos y movimientos de inventario.
- Caja, sesión y venta demo.

El seed está pensado para ser idempotente y no duplicar los datos demo al ejecutarse nuevamente.

## API protegida: ejemplo

```bash
curl http://localhost:3000/api/v1/customers \
  -H 'Authorization: Bearer navaja-demo-session' \
  -H 'x-tenant-id: UUID_DEL_TENANT'
```

La API debe devolver datos solamente si:

- el token es válido;
- el tenant existe y está activo;
- el usuario tiene membership activa;
- la consulta está filtrada por `tenant_id`.

## Pruebas realizadas

Se han validado:

- Conexión a PostgreSQL en Render.
- Aplicación de migraciones.
- `tenant_id` en 33 tablas operativas.
- Ninguna columna operativa `tenant_id` nullable.
- Seed de tenant y usuarios.
- Listado y creación de clientes.
- Listado de sucursales, catálogo, inventario y citas.
- Rechazo de un tenant sin membership.
- Aislamiento de consultas por tenant.
- Typecheck de API y frontend.
- Build de producción del frontend.

## Estado actual y pendientes

### Implementado

- Monorepo pnpm.
- Frontend Angular.
- API Next.js.
- PostgreSQL con Drizzle.
- `withTenantRequest`.
- Membership por empresa.
- Roles `admin` y `app`.
- `tenant_id` en tablas operativas.
- Repositorios con filtros tenant.
- Migraciones aplicadas.
- Seed realista de barbería.
- Landing y login integrados.

### Pendiente para producción

1. Conectar completamente Better Auth con las cuentas `admin` y `app` reales.
2. Desactivar `DEMO_AUTH` en producción.
3. Aplicar `hasPermission` en todos los endpoints sensibles.
4. Aplicar `branch scope` en cada consulta que use sucursales.
5. Agregar índices compuestos por `tenant_id` y claves de búsqueda.
6. Revisar unicidades globales como SKU, email y código de sucursal para que sean tenant-scoped.
7. Agregar pruebas automatizadas de aislamiento entre dos tenants.
8. Añadir rate limiting, CSRF y gestión de secretos.
9. Configurar backups, restauración y observabilidad.
10. Implementar idempotencia completa para reservas, caja e inventario.

## Documentación adicional

- [Arquitectura del backend](BACKEND.md)
- [Modelo de datos](DATABASE.md)
- [Arquitectura del frontend](FRONTEND.md)
