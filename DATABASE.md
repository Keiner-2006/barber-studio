# Especificación de base de datos

## 1. Decisión de aislamiento

Para el MVP se utiliza **un servidor PostgreSQL y una base compartida**, con el tenant resuelto por `tenant_id` desde la sesión y validado contra `platform_memberships`. Todas las rutas protegidas ejecutan dentro de `withTenantRequest`, por lo que un usuario solo puede operar si pertenece activamente al tenant solicitado.

La base separada por empresa queda como evolución futura. Mientras varias empresas compartan esta base, las tablas operativas deben incorporar `tenant_id` y sus repositorios deben filtrar siempre por el tenant del `RequestContext`; la validación de membership por sí sola no debe considerarse aislamiento de filas.

Existe una base central lógica `platform_db` para onboarding, identidad, aprovisionamiento y metadatos técnicos. En el entorno actual esa capa comparte físicamente `DATABASE_URL`; puede separarse mediante `PLATFORM_DATABASE_URL` cuando se aprovisione infraestructura dedicada.

Cada empresa puede tener múltiples sucursales. Todos los datos operativos incluyen `branch_id` cuando su alcance sea local; el backend valida que el usuario tenga acceso a esa sucursal.

## 2. Base central `platform_db`

Convenciones: UUID v7 como identificador, `timestamptz` en UTC, soft delete solo donde aplique, y `created_at`/`updated_at` en todas las tablas mutables.

### `platform_tenants`

- `id uuid pk`
- `legal_name`, `trade_name`, `slug` únicos
- `status`: `provisioning | active | suspended | deleting | deleted`
- `country_code`, `timezone`, `currency_code`, `locale`
- `database_host`, `database_name`, `database_secret_ref`, `schema_version`
- `created_at`, `updated_at`

Nunca almacenar contraseñas de bases en texto; `database_secret_ref` apunta a un gestor de secretos.

### `platform_users`

- `id uuid pk`, `email citext unique`, `password_hash`
- `status`: `invited | active | blocked`
- `last_login_at`, `created_at`, `updated_at`

### `platform_memberships`

- `id`, `tenant_id`, `user_id`, `role`: `owner | platform_support`
- `status`, timestamps
- unique `(tenant_id, user_id)`

### `tenant_provisioning_jobs`

- `id`, `tenant_id`, `idempotency_key unique`
- `status`: `queued | running | succeeded | failed | compensated`
- `step`, `error_code`, `error_detail`, timestamps

### `platform_sessions`, `platform_audit_events`

Sesiones revocables y auditoría de acciones administrativas. La auditoría debe guardar actor, tenant, acción, recurso, resultado, IP y user agent sin incluir secretos.

## 3. Base operativa por tenant

### Identidad, sucursales y permisos

`users` referencia al usuario de plataforma mediante `platform_user_id` y mantiene datos locales. `roles`, `permissions`, `role_permissions` y `user_roles` implementan RBAC. `user_branches` limita el acceso a sucursales.

`branches`: `id`, `code unique`, `name`, dirección, teléfono, timezone opcional, `status active|inactive`, horarios JSON validado, timestamps.

`staff_profiles`: `user_id`, `display_name`, `bio`, `avatar_url`, `commission_rate`, `is_bookable`, `status`. `staff_services` relaciona barberos con servicios y permite duración/precio override.

### Catálogo

`service_categories`: nombre, descripción, orden, activo.

`services`: `category_id`, nombre, descripción, duración_minutos positiva, precio_base numeric(12,2), moneda, `payment_policy`: `none | deposit | full`, `deposit_type`: `fixed | percentage`, `deposit_value`, cancelación en minutos, activo, soft delete.

`branch_services`: disponibilidad del servicio por sucursal, precio local, duración local, activo. Los precios se muestran siempre con moneda y política configurada.

`staff_schedules`: `staff_id`, `branch_id`, día de semana, hora inicio/fin, vigencia. `staff_time_off`: bloqueos con rango y motivo.

### Clientes y reservas

`customers`: nombre, email, teléfono, documento opcional, preferencias, consentimientos, timestamps.

`appointments`: `id`, `branch_id`, `customer_id`, `staff_id`, `service_id`, `starts_at`, `ends_at`, snapshot de nombre/precio/duración, `status`: `pending | confirmed | checked_in | in_service | completed | cancelled | no_show`, `source`, `notes`, `cancellation_reason`, timestamps.

`appointment_payments`: reserva, importe, moneda, `status`: `pending | recorded | refunded | voided`, `method`: `cash | card_manual | transfer_manual | other`, referencia, registrado por, timestamps.

Para evitar doble reserva, usar PostgreSQL `EXCLUDE USING gist` sobre `tstzrange(starts_at, ends_at, '[)')` con igualdad por `staff_id` y `status` no cancelado/no-show. Requiere `btree_gist`. La creación usa idempotency key única por actor y solicitud; la transacción valida sucursal, horario, política de pago y captura el error de exclusión como conflicto 409.

### Inventario y compras

`products`: SKU único, nombre, descripción, categoría, unidad, costo numeric(12,2), precio sugerido, stock mínimo, activo.

`branch_inventory`: producto/sucursal, cantidad numeric(12,3), reservado, costo promedio, unique `(branch_id, product_id)`.

`inventory_movements`: producto, sucursal, tipo `purchase | sale | adjustment | transfer_in | transfer_out | consumption | return`, cantidad firmada, costo unitario, referencia, actor, timestamps. El stock se actualiza dentro de la misma transacción.

`suppliers`, `purchase_orders`, `purchase_order_items`, `goods_receipts` soportan compras y recepción parcial. Transferencias entre sucursales se modelan como documento con movimientos compensatorios.

### Caja y pagos manuales

`cash_registers`: sucursal, nombre, estado, saldo inicial, abierta/cerrada por usuarios.

`cash_sessions`: caja, usuario, apertura/cierre, saldo esperado, saldo contado, diferencia.

`cash_transactions`: sesión, tipo `sale | appointment | expense | refund | adjustment`, método, importe, moneda, referencia, notas, timestamps. Nunca editar transacciones conciliadas; usar reversos.

### Promociones, reportes y auditoría

`promotions`, `promotion_services`, `promotion_branches`, `promotion_redemptions` con vigencia, límites y reglas explícitas.

Los reportes se calculan desde consultas/materialized views por tenant: ventas, ocupación, ticket promedio, servicios, comisiones, inventario bajo y caja. `audit_events` registra create/update/delete/status_change/export/login con before/after JSON sanitizado.

## 4. Integridad y convenciones

- Dinero: `numeric(12,2)`, nunca float; moneda ISO 4217.
- Fechas: UTC en almacenamiento; presentación con timezone de empresa/sucursal.
- FK con `ON DELETE RESTRICT` para historial financiero y `CASCADE` solo en tablas puente.
- Índices: agenda por `(branch_id, starts_at)`, `(staff_id, starts_at)`, estado de reservas; inventario por SKU y sucursal; clientes por email/teléfono normalizados.
- Soft delete para catálogo, clientes y usuarios; no borrar historial financiero, reservas completadas ni movimientos.
- Optimistic locking con `version integer` en caja, inventario y configuraciones críticas.
- Todas las escrituras sensibles requieren actor y audit event.

## 5. Aprovisionamiento y operación

En el MVP compartido, el onboarding crea el tenant y sus memberships en la misma base, y cada request valida el `tenant_id` antes de acceder a repositorios. La migración posterior a una base por tenant reutilizará `database_secret_ref` y el pool dinámico ya preparado en backend.

1. Crear tenant en `platform_db` con estado `provisioning`.
2. Generar base, usuario restringido y secreto por referencia.
3. Ejecutar migraciones versionadas desde un migrator controlado.
4. Crear datos iniciales, owner y sucursal principal.
5. Marcar `active` solo después de health check y migración correcta.
6. Ante fallo, reintentar por etapa; si no es recuperable, revocar secreto, eliminar recursos y marcar `compensated`.

Cada base requiere backups automáticos, PITR, retención configurable, restauración ensayada, rotación de credenciales, métricas de conexiones y alertas. Usar pooler/proxy para evitar una conexión permanente por tenant y límites de concurrencia por plan.

## 6. Riesgos y decisiones abiertas

- Muchas bases aumentan costo de backups, migraciones y observabilidad.
- Definir proveedor de aprovisionamiento, pooler, límites por plan y estrategia de migraciones online.
- Definir residencia de datos, retención, facturación futura, exportación y borrado legal.
- Pagos online y notificaciones quedan fuera del MVP, pero sus interfaces se preparan en backend.
- Validar si algunos tenants empresariales requerirán alta disponibilidad o réplicas dedicadas.

## 7. Pruebas mínimas

Migraciones desde cero, aislamiento entre bases, permisos por sucursal, concurrencia de reservas, idempotencia, reversos de caja, recepción parcial de compras, restauración de backup y pruebas de borrado/retención.
