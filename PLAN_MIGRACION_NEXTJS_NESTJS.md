# Plan de migración de la API de Next.js a NestJS

## 1. Objetivo

Migrar gradualmente la API hoy desplegada en `apps/api` desde Next.js App Router a NestJS, conservando el frontend Angular, los contratos HTTP y la persistencia actuales. El resultado buscado es un backend independiente, modular y desplegable sin obligar a reescribir la aplicación ni a migrar datos al mismo tiempo.

La estrategia recomendada es una migración incremental tipo *strangler*: NestJS implementa grupos de endpoints y recibe tráfico de forma progresiva; Next.js continúa atendiendo lo que aún no se ha migrado. Solo se retira Next.js cuando se haya demostrado paridad funcional, de seguridad y operativa.

## 2. Situación actual y principios

- `apps/api` es un servicio Next.js independiente del frontend Angular. El frontend concentra el origen de API en `environment.apiUrl` y utiliza rutas bajo `/api/v1`.
- La API ya cuenta con módulos de dominio, casos de uso, puertos, repositorios, schemas Zod y un `ServiceRegistry`; es una base aprovechable, pero no toda la lógica está separada de los route handlers.
- Hay handlers que realizan normalización de datos, resolución de tenant, validación, orquestación y reglas de negocio. Esas responsabilidades deben extraerse a servicios/casos de uso antes de trasladar el transporte HTTP.
- Better Auth está conectado con `toNextJsHandler`; su integración HTTP debe sustituirse o aislarse y probarse por separado.
- La persistencia actual usa PostgreSQL y Drizzle para los repositorios de negocio. El destino acordado es PostgreSQL con TypeORM; el cambio de ORM forma parte del alcance, pero se hará por módulos y sin rediseñar simultáneamente el esquema.
- Better Auth mantiene su propia conexión `pg` y no depende del repositorio Drizzle de negocio. En principio se conservará así durante la migración, separando su cambio de transporte HTTP de la migración del ORM.
- La topología multi-tenant debe verificarse antes de configurar TypeORM: el código mantiene pools indexados por tenant, pero la resolución actual puede apuntar todos a la misma URL y aplicar aislamiento mediante `tenant_id`.
- `apps/web`, `packages/shared`, los endpoints existentes y el modelo de sesión son dependencias del plan. Los cambios de contrato deben ser explícitos y versionados.

### Principios que acotan el proyecto

1. Mantener `/api/v1`, payloads, códigos HTTP, formato de errores, cookies y comportamiento CORS salvo cambio aprobado.
2. Mantener Better Auth y las sesiones existentes mientras se comprueba compatibilidad con NestJS. No migrar usuarios ni cambiar proveedor de autenticación en este proyecto.
3. Reutilizar reglas de negocio, contratos y SQL/esquemas actuales; migrar los repositorios de Drizzle a entidades y repositorios TypeORM por módulo.
4. No migrar base de datos, frontend Angular, proveedor de PostgreSQL ni servicios externos como parte del cambio de framework.
5. Mantener arquitectura de monolito modular NestJS; no convertir cada módulo en un microservicio.
6. No duplicar la ejecución de operaciones con efectos secundarios durante la convivencia de las dos APIs.

## 3. Arquitectura destino

NestJS será el único backend HTTP una vez finalizada la migración. Cada módulo NestJS debe mantener separadas, en la medida que el código actual lo permita, estas responsabilidades:

- **Controller:** traducción HTTP, validación de entrada, códigos de respuesta y delegación.
- **Application:** casos de uso y coordinación de las operaciones.
- **Domain:** reglas de negocio y modelos independientes del framework.
- **Drivers/persistencia:** entidades y repositorios TypeORM, conexiones, almacenamiento y adaptadores de proveedores. Better Auth se trata como integración independiente.

La capa HTTP no debe importar `NextRequest`, `NextResponse`, `next/headers` ni depender de variables globales de request de Next.js. La resolución de usuario, tenant, membresía, rol y sucursal debe producir un contexto de request explícito y validado, equivalente al contexto actual.

### Estructura y prácticas tomadas de la plantilla

La referencia es `apps/Backend/src/GuiaBackend/talent-api-management-absences/src`. Se adopta su separación conceptual, organizada preferentemente por módulo funcional para evitar capas globales con dependencias cruzadas:

```text
src/modules/<feature>/
	adapters/http/       # controllers, DTOs, guards, filtros/interceptors del módulo
	domain/              # reglas, modelos y puertos/casos de uso
	drivers/persistence/ # entidades TypeORM y repositorios concretos
	<feature>.module.ts  # wiring de dependencias del módulo
src/shared/             # configuración, errores, logging, auth, tenancy y DB común
```

- Los controllers validan y traducen HTTP; los casos de uso coordinan operaciones; los drivers encapsulan TypeORM. El dominio no devuelve entidades TypeORM ni conoce decorators del framework.
- Las dependencias de persistencia se expresan con puertos y tokens/clases abstractas de inyección explícitos, porque las interfaces TypeScript no existen en runtime para el contenedor de NestJS.
- DTOs de entrada/salida se mantienen separados de entidades y modelos internos. Validación global con whitelist y rechazo de propiedades no permitidas, conservando los contratos actuales.
- Configuración centralizada y validada al arrancar; filtros de excepciones con respuesta estándar; request ID y logs estructurados sin credenciales, tokens ni datos sensibles.
- TypeORM debe usar `synchronize: false`. Esquema productivo solo cambia por migraciones revisadas, explícitas y ejecutadas una vez por pipeline, nunca al arrancar cada instancia.

La plantilla es guía de estructura, no implementación para copiar literalmente. En el ejemplo hay CORS abierto, un puerto fijo pese a leer configuración, una llamada incorrecta a `parseInt` para el puerto, paginación calculada pero luego ignorada, errores de caso de uso convertidos en respuestas genéricas y dependencias Sequelize/TypeORM simultáneas. El backend nuevo debe evitar esos defectos: allowlist de orígenes, puerto configurado, parámetros realmente aplicados, errores tipados y dependencias mínimas.

### Estrategia de transición a TypeORM

- La API Next.js seguirá usando Drizzle mientras continúe atendiendo rutas. NestJS usará TypeORM desde sus primeros endpoints. Ambos ORMs pueden convivir temporalmente sobre el mismo PostgreSQL siempre que mapeen el mismo esquema y no escriban dos veces la misma operación.
- Crear entidades TypeORM que reflejen el esquema existente: tablas y columnas snake_case, UUID, enums PostgreSQL, timestamps con zona horaria, `numeric` con precisión/escala, defaults, índices, constraints y relaciones. No permitir que TypeORM cree o altere tablas implícitamente.
- Antes de migrar datos, comparar metadata de entidades y esquema real en una base de staging; esta etapa no debe transformar ni copiar filas. La migración es de acceso a datos, no de proveedor de base.
- Establecer TypeORM como único autor de nuevas migraciones SQL desde el inicio de la app NestJS. Registrar un baseline del esquema existente sin volver a ejecutar DDL histórico de Drizzle; las migraciones futuras deben ser incrementales y compatibles con la API Next.js que siga activa.
- Desactivar `db:push` y la ejecución automática de migraciones al iniciar servicios productivos. Ejecutar el comando de migración de forma controlada en el pipeline antes de desplegar código que dependa del cambio.
- Implementar un `DataSource` de plataforma y definir, según la topología confirmada, un `DataSource` por tenant o un único `DataSource` con filtros estrictos por `tenant_id`. Si se requieren conexiones por tenant, usar un gestor con caché acotada, límites de pool, cierre/expiración y clave de conexión estable; nunca cambiar una conexión compartida mutable por request.
- Mantener Better Auth con su conexión `pg` actual durante esta migración. No intentar mapear sus tablas a TypeORM ni cambiar el almacenamiento de sesiones como efecto colateral del traslado.

NestJS puede comenzar como una aplicación temporal independiente dentro del workspace (por ejemplo, `apps/api-nest`) para permitir despliegue y comparación paralelos. La ubicación y el nombre definitivos se decidirán antes del bootstrap para no romper los filtros pnpm, `render.yaml` ni los comandos de CI. No se cambiará a Fastify durante esta migración: mantener el adaptador Express de NestJS reduce diferencias y facilita compatibilidad con integraciones Node existentes.

## 4. Fases de ejecución

### Estado de ejecución al 2026-10-09

- Creada la app paralela `apps/api-nest` con bootstrap NestJS, configuración TypeORM con `synchronize: false`, CORS por allowlist y formato de error con `requestId`.
- Migrada como primera vertical `GET /api/v1/public/businesses/:slug`, incluyendo entidades TypeORM para `platform_tenants` y `tenant_branding`, con selección explícita de columnas públicas.
- Añadidos `GET /api/v1/health/live` y `GET /api/v1/health/ready`, scripts del workspace para desarrollo/build/typecheck/pruebas y configuración Render paralela sin cambiar el upstream actual de Angular.
- Verificados build, typecheck y cinco pruebas unitarias del caso de uso y del driver TypeORM.
- **Pendiente antes de enrutar tráfico:** validar las entidades y consultas contra PostgreSQL de staging, comprobar el deploy Render, confirmar la política de migraciones/baseline y probar la URL desplegada desde Angular o pruebas E2E. Este avance no equivale a completar la migración.

### Fase 0: inventario, decisiones y línea base

**Trabajo**

- Inventariar cada ruta actual: método, path, autenticación, tenant/branch scope, rol requerido, DTO de entrada/salida, status codes, dependencias y efectos secundarios.
- Clasificar rutas por módulo y riesgo: auth, onboarding/tenants, media, sucursales, catálogo, clientes, staff, disponibilidad/citas, caja, inventario/compras, reportes y administración.
- Marcar qué reglas están en los handlers y cuáles en servicios/casos de uso; priorizar la extracción de las primeras.
- Capturar contratos existentes con pruebas de integración/contrato antes de cambiar la implementación.
- Verificar el comportamiento del frontend, CORS, cookies SameSite/Secure, CSRF, URL base y configuración de proxy para local, preview y producción.
- Inventariar las tablas y migraciones Drizzle aplicadas en cada entorno y contrastarlas con el esquema PostgreSQL real, incluidos enums, índices, defaults, constraints y timestamps.
- Confirmar si tenants comparten una base con `tenant_id` o tienen bases separadas; revisar `getTenantDb()` y `resolveDatabaseUrl()` antes de diseñar los DataSources TypeORM.
- Definir cómo se registrará el baseline TypeORM en cada base existente sin volver a ejecutar el DDL histórico de Drizzle.
- Elegir la estrategia de tráfico (proxy/routing por path o dominio estable) y confirmar cómo la plataforma de hosting desplegará dos servicios desde el monorepo.
- Auditar secretos de despliegue: retirar valores sensibles del repositorio/configuración versionada y rotarlos si corresponde. No copiarlos a la nueva aplicación.

**Criterio de salida**

Hay inventario aprobado de endpoints y dependencias, tests de referencia para los flujos críticos, estrategia de rollback y una decisión documentada para el manejo de Better Auth en NestJS.

### Fase 1: extraer y estabilizar los límites de aplicación

**Trabajo**

- Mover la lógica de onboarding que hoy transforma payloads y coordina la creación del tenant a un caso de uso invocable sin Next.js.
- Extraer la orquestación de citas que esté en routes (búsqueda de servicio, duración, conflictos, snapshots e idempotencia) a la capa de aplicación; el handler debe limitarse a traducir HTTP.
- Aplicar el mismo criterio a los demás endpoints donde el route handler implementa reglas o consulta directamente repositorios.
- Estandarizar errores, validación, `requestId`, respuestas y contexto autenticado/tenant sin acoplarlos a `NextResponse`.
- Sustituir accesos globales/singletons por proveedores explícitos donde NestJS requiera ciclo de vida o aislamiento por request. Validar especialmente conexiones y contexto multi-tenant.
- Definir puertos de repositorio y casos de uso que admitan adapters intercambiables; no filtrar entidades TypeORM ni builders de consulta al dominio, HTTP o `packages/shared`.
- Añadir pruebas unitarias a reglas extraídas y conservar pruebas de contrato HTTP en Next.js para asegurar que la refactorización no cambia comportamiento.

**Criterio de salida**

Los casos de uso priorizados se prueban sin Next.js; se mantienen los resultados HTTP existentes y no se han introducido cambios de esquema ni de contrato.

### Fase 2: bootstrap de NestJS y pruebas de compatibilidad transversales

**Trabajo**

- Crear la aplicación NestJS en el workspace y conectar scripts de desarrollo, build, typecheck y test.
- Configurar módulos base: configuración validada al inicio, logging/request ID, filtro global de errores, validación Zod o equivalente consistente con los schemas existentes, serialización y health checks.
- Implementar CORS, preflight, headers de seguridad, límites de payload y manejo de errores con paridad respecto al servicio actual.
- Configurar TypeORM con `DataSource` explícitos, entidades registradas por módulo y providers de conexión con ciclo de vida claro. `synchronize` debe permanecer desactivado.
- Crear y probar el baseline TypeORM contra una copia de staging del esquema actual. Comparar tablas/columnas, enums, nullability, defaults, índices, foreign keys y precisión temporal/decimal sin aplicar DDL histórico ni modificar datos.
- Implementar el gestor de conexiones compatible con la topología multi-tenant confirmada y probar aislamiento entre requests y cierre de pools.
- Preparar comandos separados para build, migraciones explícitas y seed de desarrollo/pruebas. Las migraciones productivas no se ejecutan automáticamente al arrancar instancias.
- Implementar una prueba vertical pequeña con un endpoint de bajo riesgo y sin efectos secundarios, utilizando los mismos contratos y una instancia de base de datos de prueba.
- Hacer una prueba técnica de Better Auth: rutas de auth, lectura/escritura de cookies, logout, refresh/expiración, headers y orígenes del frontend. Decidir si se puede mantener el protocolo actual detrás de un adaptador NestJS o si hace falta un handler Node compatible soportado por Better Auth. Si no se confirma compatibilidad, mantener temporalmente auth en Next.js y enrutar esas rutas allí; no improvisar un reemplazo de sesiones.

**Criterio de salida**

NestJS compila, arranca y ejecuta pruebas; health/readiness, CORS, errores, base de datos, aislamiento de tenant y estrategia de auth están validados antes de migrar grupos funcionales.

### Fase 3: migrar endpoints de bajo riesgo y validar tráfico

Migrar primero endpoints de lectura o baja criticidad, por ejemplo health checks, negocio público por slug y consultas de reportes de solo lectura, siempre que el inventario confirme que no exponen datos sin autorización. Cada grupo migra junto con sus repositorios Drizzle a TypeORM; cambiar solo el endpoint no cuenta como un módulo migrado.

Para cada grupo:

1. Mapear las tablas del módulo a entidades TypeORM sin alterar el esquema; revisar manualmente nombres, tipos y relaciones.
2. Implementar repository/driver TypeORM detrás del puerto de aplicación y contrastar lecturas con las consultas Drizzle en pruebas de integración.
3. Añadir controller/provider NestJS y pruebas unitarias, integración y contrato; comprobar que no se serializan entidades crudas.
4. Comparar respuesta, status, headers, permisos, resultados, transacciones y tiempos con el servicio Next.js.
5. Desplegar NestJS en un entorno no productivo y ejecutar pruebas E2E con el frontend real o una copia de staging.
6. En producción, dirigir el grupo completo a NestJS mediante proxy/routing controlado; mantener un solo handler activo para escrituras y rollback inmediato al upstream anterior.
7. Observar errores, latencia, consultas, conexiones y logs con `requestId`.

**Orden inicial sugerido**

1. Health y readiness.
2. Rutas públicas de negocio y lecturas sin efectos secundarios.
3. Reportes de lectura.
4. Catálogo, sucursales, staff y clientes, según acoplamientos detectados.

**Criterio de salida**

Cada grupo alcanza paridad de contrato y seguridad en staging y producción; no presenta regresiones relevantes durante el periodo de observación acordado.

### Fase 4: auth, onboarding y operaciones transaccionales

Migrar las áreas de mayor riesgo después de que las bases transversales estén probadas.

- **Auth y contexto:** migrar login/sesión/logout solo cuando Better Auth haya pasado la prueba de compatibilidad; comprobar cookies en dominios reales y flujos de Angular. Better Auth mantiene su pool PostgreSQL actual; no convertir sus tablas a entidades TypeORM ni cambiar formato/token o expiración implícitamente.
- **Onboarding y tenant provisioning:** preservar idempotencia, estados recuperables, reintentos y compensaciones; probar reintentos y fallos parciales. No crear un segundo tenant cuando el cliente reenvíe una petición ya procesada.
- **Agenda y disponibilidad:** migrar repositorios de appointments/catalog/staff a TypeORM; validar timezone, branch scope, bloqueos y concurrencia con solicitudes simultáneas para el mismo horario. Mantener transacciones y constraints actuales.
- **Caja, inventario y compras:** migrar repositorios TypeORM preservando atomicidad, autorización por rol/sucursal, auditoría e idempotencia. No ejecutar en paralelo un comando con efecto financiero o de stock en Next.js y NestJS.
- **Media:** conservar el flujo de firma/subida y permisos, verificando que las credenciales secretas solo estén en servidor.

**Criterio de salida**

Cada flujo crítico tiene pruebas de regresión y concurrencia, trazabilidad de efectos secundarios, monitoreo, plan de rollback y aceptación funcional del usuario responsable.

### Fase 5: completar paridad y cambiar el backend por defecto

**Trabajo**

- Migrar los grupos restantes y comparar el inventario inicial con las rutas implementadas en NestJS.
- Cambiar el upstream por defecto a NestJS manteniendo el hostname y `/api/v1` estable para Angular.
- Mantener Next.js disponible durante una ventana de observación, pero fuera del camino de escritura para evitar doble ejecución.
- Eliminar el proxy temporal por endpoint cuando la paridad quede demostrada.
- Actualizar documentación, variables de entorno, scripts, despliegue, alertas, runbooks y responsables operativos.

**Criterio de salida**

Todos los endpoints productivos están servidos por NestJS o existe una excepción temporal documentada y aprobada. Los flujos críticos cumplen los SLO/umbrales de error definidos antes del corte y existe evidencia para restaurar el upstream anterior.

### Fase 6: retirar Next.js de la API

**Trabajo**

- Confirmar que no quedan rutas activas, webhooks, tareas programadas ni consumidores que dependan de `apps/api`.
- Retirar el servicio y los paquetes Next.js/React/Drizzle exclusivos de la API; conservar Angular y el paquete compartido. Better Auth puede seguir usando su pool `pg` independiente.
- Limpiar scripts, configuración Render, CI, variables obsoletas y documentación.
- Eliminar adaptadores temporales y código duplicado solo después del periodo de rollback acordado.

**Criterio de salida**

NestJS es el único backend de API en producción, los procesos de despliegue y soporte están actualizados y no hay tráfico ni jobs dependientes del runtime Next.js.

## 5. Pruebas y gates obligatorios

- **Contrato:** mismo método, path, JSON, status codes, error envelope, headers y semántica de paginación.
- **Autenticación:** sesión válida, inválida, expirada, logout, cookies seguras, CORS y CSRF cuando corresponda.
- **Autorización/tenancy:** tenant derivado de una sesión verificada; rol y branch scope en cada operación; no confiar en `tenantId` del body.
- **Persistencia:** metadata de entidades TypeORM contra el esquema real, repositorios, transacciones, baseline/migraciones y aislamiento de conexiones o consultas por tenant. Durante la convivencia, probar interoperabilidad entre TypeORM y Drizzle sobre el mismo esquema.
- **Flujos sensibles:** onboarding idempotente, reserva concurrente, movimientos de inventario y operaciones de caja.
- **Operación:** health/readiness, logs estructurados, request ID, métricas de latencia/errores, límites, shutdown y rollback.
- **Frontend:** pruebas E2E desde Angular en local/staging con el origen, cookies y URL de producción equivalentes.

No se cambia el tráfico productivo de un módulo si falla alguno de sus gates de seguridad o de contrato.

## 6. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Diferencias de sesión o cookies al cambiar el adaptador HTTP | Spike de Better Auth en la Fase 2; migrar auth por separado o mantenerlo temporalmente en Next.js. |
| Pérdida de aislamiento entre tenants por ciclo de vida de providers | Contexto por request explícito y pruebas cruzadas con tenants distintos. Evitar guardar tenant/DB activa en singletons mutables. |
| Regresión porque una ruta contiene reglas de negocio | Inventario y extracción en Fase 1; pruebas de contrato antes de cambiar el transporte. |
| Doble ejecución de citas, caja, onboarding o stock | Routing exclusivo por grupo y corte de escrituras; no usar shadow writes para operaciones con efectos secundarios. |
| Incompatibilidad de path, errores o CORS con Angular | Conservar `/api/v1`, DTOs y pruebas E2E usando `environment.apiUrl`. |
| Divergencia entre entidades TypeORM y esquema real o entre migradores | Baseline explícito, `synchronize: false`, un único ejecutor de migraciones, comparación del esquema en CI/staging y cambios compatibles mientras Next.js siga desplegado. |
| Pools TypeORM no acotados o contexto de tenant compartido entre requests | Confirmar topología real; gestionar DataSources con límites, expiración y cierre, contexto inmutable por request y pruebas de aislamiento. |
| Cambio de ORM altera transacciones, nullability, decimales o fechas | Pruebas de integración contra PostgreSQL y regresiones para dinero, timestamps, enums y operaciones atómicas. |
| Fallo del nuevo servicio en producción | Deploy paralelo, health checks, métricas, ventana de observación y rollback de upstream preparado. |
| Secretos expuestos o duplicados en configuración | Revisar secretos antes del despliegue nuevo, rotar los comprometidos y usar variables/secret manager del hosting. |

## 7. Decisiones que deben cerrarse antes de implementar

1. Ruta/nombre de la app NestJS temporal y cómo se construye desde el workspace pnpm.
2. Estrategia de routing para mantener el dominio actual de API y facilitar rollback.
3. Topología efectiva de datos por tenant y diseño final de DataSources TypeORM.
4. Baseline TypeORM por base y pipeline único de migraciones compatible con la convivencia.
5. Soporte real de Better Auth fuera de Next.js y responsable del manejo de cookies/sesiones.
6. Definición de SLO/umbrales de aceptación y duración de observación por grupo.
7. Entornos y base de datos de staging para pruebas de tenant, integración y concurrencia.
8. Política para retirar la API Next.js y duración máxima de la convivencia.

## 8. Fuera de alcance

- Migrar autenticación a Supabase, OAuth u otro proveedor.
- Cambiar PostgreSQL, el esquema de negocio o la topología de bases por tenant. La sustitución de Drizzle por TypeORM sí está dentro del alcance y se hará por módulos.
- Reescribir Angular o rediseñar contratos sin versionado.
- Incorporar microservicios, colas o proveedores nuevos salvo que una dependencia actual lo exija y se apruebe por separado.
- Rehacer la lógica de negocio que ya funcione, salvo la extracción necesaria para quitar acoplamiento con Next.js.
