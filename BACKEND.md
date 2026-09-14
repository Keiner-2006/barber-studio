# Especificación del backend Next.js

## 1. Propósito y arquitectura

Next.js funciona como API backend independiente del frontend Angular. Se recomienda un monorepo con `apps/api` y `apps/web`, pero ambos se despliegan y versionan como aplicaciones separadas.

La arquitectura es Clean/Hexagonal:

```text
src/
  modules/{identity,tenants,branches,catalog,customers,appointments,inventory,purchasing,cash,reports}/
    domain/          # entidades, value objects, eventos, reglas
    application/     # casos de uso, DTOs, puertos
    infrastructure/  # repositorios, SQL, proveedores externos
    presentation/    # schemas, mappers, handlers
  shared/
    auth/ tenancy/ errors/ pagination/ observability/
  composition/       # container y wiring
app/api/              # route handlers delgados
```

Las rutas traducen HTTP a comandos/query y delegan al caso de uso. No contienen SQL ni reglas de negocio.

## 2. Resolución de tenant y seguridad

El registro crea el tenant en la base central y entrega una sesión. En cada request autenticada:

1. validar cookie/session token y CSRF cuando aplique;
2. resolver membership desde `platform_db`;
3. cargar metadata y secreto del tenant desde un secret manager;
4. obtener conexión acotada a esa base;
5. validar rol y alcance de sucursal;
6. ejecutar el caso de uso con `RequestContext` inmutable.

Nunca aceptar `tenantId` de un body como autoridad. El tenant proviene de sesión y, opcionalmente, de un subdominio verificado. Los administradores de plataforma usan una ruta separada y permisos explícitos.

RBAC: `owner`, `admin`, `reception`, `barber`, `inventory_manager`, `accountant`, `customer`. Las reglas de branch scope se aplican en cada query, no solo en la interfaz.

## 3. Onboarding y ciclo de vida

`POST /v1/onboarding/tenants` valida empresa, usuario owner, país, moneda y timezone. Un job idempotente ejecuta `create_database`, `create_credentials`, `migrate`, `seed`, `create_owner`, `health_check`, `activate`. El estado es consultable mediante `GET /v1/onboarding/{jobId}`.

Cada etapa tiene retry con backoff. La saga registra compensaciones y no activa el tenant parcialmente. La key de idempotencia evita duplicar empresas cuando el cliente reintenta.

## 4. Contrato API

Prefijo `/v1`; JSON; fechas ISO-8601; dinero como string decimal más `currency`; paginación cursor-based.

### Sesión y administración

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/session`
- `GET/PATCH /me`, `GET /users`, `POST /users/invite`
- `GET/POST/PATCH /branches`
- `GET/POST/PATCH /roles`, `/permissions`

### Catálogo

- `GET/POST/PATCH /service-categories`
- `GET/POST/PATCH /services`
- `GET/PATCH /branches/{branchId}/services`
- `GET/PATCH /staff/{staffId}/schedule`

### Agenda y reservas

- `GET /availability?branchId&serviceId&staffId&from&to`
- `GET/POST/PATCH /appointments`
- `POST /appointments/{id}/confirm`, `/check-in`, `/start`, `/complete`, `/cancel`, `/no-show`
- `GET/POST /customers`

La disponibilidad se calcula respetando horario, bloqueos, duración, reservas activas y capacidad. Crear una reserva exige `Idempotency-Key`; conflictos de rango devuelven 409 con slots alternativos.

### Inventario y compras

- `GET/POST/PATCH /products`
- `GET /inventory`, `POST /inventory/adjustments`, `POST /inventory/transfers`
- `GET/POST/PATCH /suppliers`
- `GET/POST/PATCH /purchase-orders`, `POST /purchase-orders/{id}/receive`

### Caja y pagos manuales

- `POST /cash-registers/{id}/open`, `/close`
- `GET/POST /cash-sessions/{id}/transactions`
- `POST /appointments/{id}/payments`
- `POST /payments/{id}/void` o `/refund` según permisos

### Reportes y auditoría

- `GET /reports/sales`, `/occupancy`, `/services`, `/inventory`, `/cash`
- `GET /audit-events`
- `GET /health/live`, `/health/ready`

## 5. Validación y errores

Usar schemas compartidos con una librería de validación, límites de tamaño y sanitización. Respuesta estándar:

```json
{
  "error": { "code": "APPOINTMENT_CONFLICT", "message": "El horario ya no está disponible", "details": {} },
  "requestId": "..."
}
```

Códigos: `400` validación, `401` sesión, `403` permiso, `404` recurso, `409` conflicto/idempotencia, `422` regla de negocio, `429` límite, `500` inesperado. No exponer SQL, secretos ni stack traces.

## 6. Transacciones e idempotencia

Los casos de uso que modifican reserva, caja, inventario o pagos ejecutan transacciones ACID. La reserva combina validación, exclusión de rango, snapshot de precio y auditoría en una transacción. Las operaciones con side effects guardan `idempotency_keys` por actor, endpoint y hash de payload.

Las respuestas grandes usan cursor pagination, filtros whitelisted y orden determinista. Queries siempre parametrizadas y con branch scope.

## 7. Puertos futuros

Definir interfaces `PaymentGateway`, `NotificationSender`, `FileStorage` y `EventPublisher`. En MVP los adaptadores pueden ser `ManualPaymentAdapter` y `NoopNotificationAdapter`; no instalar Stripe, WhatsApp ni correo todavía. El dominio nunca depende de proveedores.

## 8. Jobs y observabilidad

Jobs para recordatorios futuros, reportes materializados, alertas de stock, limpieza de sesiones y reconciliación. Usar un scheduler/queue externo cuando se elija proveedor.

Logs estructurados con `requestId`, `tenantId` hash o identificador no sensible, actor, route, duración y resultado. Métricas: errores por endpoint, latencia, conflictos de agenda, conexiones por tenant, jobs fallidos y divergencias de caja. Traces entre API, platform_db y tenant DB.

## 9. Pruebas

- Unitarias: value objects, políticas de pago, disponibilidad, promociones, caja e inventario.
- Integración: repositorios contra PostgreSQL real, migraciones y aislamiento.
- API: auth, RBAC, branch scope, validación, idempotencia y códigos de error.
- Concurrencia: dos reservas simultáneas para el mismo barbero.
- Contract tests: DTOs compartidos con Angular.
- E2E: onboarding, reserva completa, recepción, cierre de caja y compra/recepción.

## 10. Riesgos y decisiones abiertas

Seleccionar proveedor de PostgreSQL por tenant, secret manager, pooler, sistema de jobs, estrategia de archivos y proveedor futuro de pagos. Definir límites de rate, política de sesiones, residencia de datos y plan de migraciones masivas.
