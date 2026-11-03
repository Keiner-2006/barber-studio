# Plan: WhatsApp de contacto en la inscripción de negocios

## Objetivo

Implementar de punta a punta la captura, validación, almacenamiento y publicación del WhatsApp del negocio durante su inscripción. El WhatsApp público del negocio debe ser distinto del celular y del WhatsApp personal del propietario. Ningún campo enviado por el formulario debe descartarse silenciosamente.

Este documento describe el estado inspeccionado del flujo y el trabajo propuesto. No implementa los cambios.

## Hallazgos del flujo actual

### Formulario y cliente

- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-account.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-account.component.ts) solicita celular obligatorio y WhatsApp personal opcional del propietario.
- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-location.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-location.component.ts) solicita otro WhatsApp, rotulado como contacto del negocio/sede, además de ciudad, dirección y correo de notificaciones. El teléfono de esta sección se presenta con un prefijo visual, pero hay que asegurar que el valor enviado incluya el código internacional.
- [`../Frontend/src/app/features/onboarding/onboarding.models.ts`](../Frontend/src/app/features/onboarding/onboarding.models.ts) ya define datos de cuenta, negocio, ubicación, horarios/servicios, marca y consentimiento.
- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-activation.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-activation.component.ts) arma y envía esos bloques anidados completos a `POST /onboarding/tenants`.
- [`../Frontend/src/app/features/onboarding/onboarding.store.ts`](../Frontend/src/app/features/onboarding/onboarding.store.ts) valida el celular del propietario, pero no valida el formato de ninguno de los WhatsApp. El consentimiento enviado se fija como `true`; no se obtiene de una aceptación registrada en ese paso.
- El resumen de activación muestra el celular del propietario, pero no distingue ni confirma visualmente el WhatsApp público del negocio.
- [`../Frontend/src/app/features/onboarding/onboarding.api.ts`](../Frontend/src/app/features/onboarding/onboarding.api.ts) llama a `GET /onboarding/slug` y `GET /onboarding/{jobId}`; esas rutas no aparecen en el controlador actual.

### Backend y contrato

- [`src/modules/onboarding/adapters/http/onboarding.controller.ts`](src/modules/onboarding/adapters/http/onboarding.controller.ts) acepta `@Body() body: any`, extrae nombres como `legalName`, `tradeName` y `slug` del nivel raíz y solo crea un `PlatformTenantEntity`.
- El formulario envía `business.legalName`, `business.tradeName`, `business.slug`, etc. dentro de `business`, por lo que el contrato del controlador no coincide con el cuerpo real.
- El controlador no consume ni persiste `account`, `location`, `schedule`, `branding` o `consentAccepted`. Esto incluye el celular y los dos WhatsApp, pero también dirección, horarios, servicios, datos de propietario y marca.
- El controlador responde `{ data: { id, status } }`; el cliente espera `data.jobId`. La consulta de estado del cliente usa otra ruta que la implementada por el backend. El estado actual solo consulta el tenant y no se ve un proceso que marque un trabajo como completado.
- [`src/modules/admin/adapters/http/admin.controller.ts`](src/modules/admin/adapters/http/admin.controller.ts) solo tiene GET; sin embargo, la pantalla de administración invoca `POST /admin/tenants`.

Por tanto, el trabajo no debe limitarse a añadir una columna: primero hay que establecer un contrato y un flujo de inscripción coherentes. Tal como está el código, la inscripción completa no está implementada de extremo a extremo.

## Decisión de modelo recomendada

| Dato | Significado | Destino recomendado |
|---|---|---|
| `account.phone` | Celular personal del propietario | Perfil central del propietario (`platform_users.phone`) |
| `account.whatsapp` | WhatsApp personal del propietario, si es distinto | Perfil central del propietario (`platform_users.whatsapp`) |
| `location.whatsapp` | Número que verá el cliente para contactar/reservar en el negocio inscrito | Contacto público del tenant (`platform_tenants.whatsapp`) |
| `platform_tenants.phone` | Teléfono general existente del negocio | Conservar con su significado actual; no tratarlo automáticamente como WhatsApp |

El propietario se asocia al negocio mediante `platform_memberships` con rol `owner`; sus datos personales no deben guardarse en el registro del tenant como si fueran contactos públicos. La pantalla de ubicación es la fuente del WhatsApp público porque lo presenta como canal de atención del negocio. Si en el futuro se implementan contactos diferentes por sucursal, el dato deberá migrarse o extenderse a `branches`; hoy la inscripción no crea una sucursal.

`platform_users` ya contiene `phone` y `whatsapp` en [`src/modules/auth/drivers/persistence/platform-user.entity.ts`](src/modules/auth/drivers/persistence/platform-user.entity.ts), y la migración [`src/shared/db/migrations/AddWhatsappToUsers1793100000000.ts`](src/shared/db/migrations/AddWhatsappToUsers1793100000000.ts) añadió WhatsApp a `platform_users` y `users`. En cambio, `platform_tenants` solo tiene `phone`, tanto en su entidad como en el esquema inicial.

Antes de persistir al propietario, se debe definir cómo se vincula de forma segura la cuenta que crea Better Auth con `platform_users` y su membership. El registro actual de Better Auth solo recibe `email`, `password` y `name`; la resolución de roles consulta `platform_users` y `platform_memberships`. No se debe confiar en `account.userId` enviado por el navegador ni duplicar contraseñas para hacer esa asociación.

## Plan de implementación

### 1. Fijar y versionar un único contrato de inscripción

- Definir DTO tipado para el cuerpo anidado:
  - `account`: identidad y contactos del propietario.
  - `business`: datos del tenant.
  - `location`: datos de la primera ubicación y WhatsApp público.
  - `schedule`, `branding` y consentimiento, según el alcance funcional que se vaya a persistir.
- Reutilizar un contrato compartido si el build permite que el backend independiente y el monorepo consuman la misma definición; de lo contrario, documentar y probar el contrato en ambos lados para evitar divergencias.
- Reemplazar `any` en el controlador por DTO y validación de servidor. Validar propiedades requeridas, formatos, longitudes, tipo de negocio, slug y valores permitidos.
- Mantener los teléfonos como cadenas, no como números. Normalizar a formato internacional E.164 (por ejemplo, `+573001234567`) y rechazar entradas inválidas con un error de campo claro.
- Definir explícitamente cuáles campos son opcionales. Mantener el WhatsApp público opcional inicialmente para no bloquear el registro sin una decisión de producto que lo haga obligatorio.
- No aceptar `userId`, rol, estado, `tenantId` de propietario ni consentimiento como autoridad del cliente. Derivar la identidad desde una sesión validada y obtener el consentimiento de una interacción real.

### 2. Corregir la experiencia del formulario

- En el paso de cuenta, mantener el celular del propietario separado del WhatsApp personal. Renombrar la ayuda para explicar que no es el WhatsApp público de reservas.
- En el paso de ubicación, aclarar que el WhatsApp será visible en el perfil público del negocio. Permitir ingresar código de país o capturarlo como parte del número y almacenar/enviar el valor normalizado, no solo el número local que acompaña al prefijo visual.
- Añadir validación de formato, mensajes accesibles por campo y estado de error del servidor. No bloquear por WhatsApp vacío si es opcional.
- En el resumen del último paso, mostrar el WhatsApp público y el celular del propietario con etiquetas distintas, para permitir detectar errores antes de crear el negocio.
- No rellenar automáticamente un número con otro sin una acción explícita del usuario. Si se agrega “usar el celular del propietario”, copiar el dato explícitamente y permitir editarlo.
- Acordar cómo se registra la aceptación de privacidad/consentimiento; no enviar `consentAccepted: true` fijo.

Archivos principales:

- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-account.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-account.component.ts)
- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-location.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-location.component.ts)
- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-activation.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-activation.component.ts)
- [`../Frontend/src/app/features/onboarding/onboarding.models.ts`](../Frontend/src/app/features/onboarding/onboarding.models.ts)
- [`../Frontend/src/app/features/onboarding/onboarding.store.ts`](../Frontend/src/app/features/onboarding/onboarding.store.ts)

### 3. Implementar la persistencia central del WhatsApp del negocio

- Añadir `whatsapp text NULL` a `public.platform_tenants` mediante una migración TypeORM aditiva y reversible.
- Actualizar `PlatformTenantEntity` y [`src/shared/db/schema/platform-schema.ts`](src/shared/db/schema/platform-schema.ts) con el nuevo campo.
- Mantener los registros existentes válidos: el campo nuevo debe ser nullable y la migración no debe copiar valores de `phone` automáticamente.
- No reutilizar `platform_users.whatsapp` para el contacto del negocio: esa columna representa el contacto personal del usuario y no es el dato que deben ver los clientes.
- Revisar `platform_tenants.phone` antes de exponerlo. La página pública actual deriva un enlace de WhatsApp a partir de `phone`, aunque el endpoint público aún devuelve “not implemented”. No publicar el `phone` existente como WhatsApp por defecto: en la pantalla de administración ese dato se captura en la sección del dueño y podría ser personal.

### 4. Hacer que la creación del tenant guarde todos los campos acordados

- Extraer la lógica de persistencia del controlador a un servicio de onboarding/provisioning con transacción y errores explícitos.
- Mapear explícitamente los datos validados:
  - `business` → `PlatformTenantEntity`, incluyendo `business.whatsapp` o `location.whatsapp` según el contrato final. Recomendación actual: `location.whatsapp` → `platform_tenants.whatsapp`.
  - `account` → perfil central del propietario, manteniendo las credenciales gestionadas por Better Auth y vinculando al propietario a la cuenta autenticada.
  - membership → fila `platform_memberships` con rol `owner`.
  - `location`, `schedule` y `branding` → sus entidades/configuraciones correspondientes, o declarar estos bloques fuera del alcance de la versión; nunca aceptarlos y descartarlos silenciosamente.
  - consentimiento → persistir evidencia/versionado en un modelo adecuado; no inferir aceptación desde un booleano forzado por el frontend.
- Crear tenant, perfil del propietario y membership de forma atómica en la base central. Si el resto del aprovisionamiento es asíncrono, crear un job con estado, idempotencia y pasos reintentables; informar errores sin devolver éxito falso.
- Evitar que reintentos creen tenants, perfiles, memberships o jobs duplicados. Manejar slug duplicado con conflicto de campo legible.

Archivos principales:

- [`src/modules/onboarding/adapters/http/onboarding.controller.ts`](src/modules/onboarding/adapters/http/onboarding.controller.ts)
- [`src/modules/onboarding/onboarding.module.ts`](src/modules/onboarding/onboarding.module.ts)
- [`src/modules/auth/drivers/persistence/platform-tenant.entity.ts`](src/modules/auth/drivers/persistence/platform-tenant.entity.ts)
- [`src/modules/auth/drivers/persistence/platform-user.entity.ts`](src/modules/auth/drivers/persistence/platform-user.entity.ts)
- [`src/modules/auth/drivers/persistence/platform-membership.entity.ts`](src/modules/auth/drivers/persistence/platform-membership.entity.ts)
- [`src/modules/auth/drivers/persistence/tenant-provisioning-job.entity.ts`](src/modules/auth/drivers/persistence/tenant-provisioning-job.entity.ts)

### 5. Alinear rutas, respuesta y estado de aprovisionamiento

- Implementar el endpoint de disponibilidad del slug usado por el formulario, o cambiar el cliente para usar una ruta existente.
- Acordar una respuesta única de creación, por ejemplo `data: { jobId, tenantId, status }`, y usarla en `OnboardingApi` y la pantalla de activación.
- Alinear la ruta de polling del cliente con el endpoint del servidor. El identificador de job no debe tratarse como si fuera el ID del tenant.
- Implementar transiciones del job (`queued`, `running`, `succeeded`, `failed`) y devolver un resultado consistente con ellas.
- Revisar el flujo de registro de cuenta y el de creación del tenant para garantizar que una cuenta registrada pero con onboarding fallido pueda reintentarlo sin crear otra cuenta ni duplicar el negocio.

Archivos principales:

- [`../Frontend/src/app/features/onboarding/onboarding.api.ts`](../Frontend/src/app/features/onboarding/onboarding.api.ts)
- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-identity.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-identity.component.ts)
- [`../Frontend/src/app/features/onboarding/steps/onboarding-step-activation.component.ts`](../Frontend/src/app/features/onboarding/steps/onboarding-step-activation.component.ts)
- [`src/modules/onboarding/adapters/http/onboarding.controller.ts`](src/modules/onboarding/adapters/http/onboarding.controller.ts)

### 6. Exponer el dato sin filtrar información personal

- Cambiar la respuesta pública del negocio para entregar un campo explícito `whatsapp`, no reutilizar ambiguamente `phone`.
- Actualizar [`../Frontend/src/app/features/public-business/public-business.component.ts`](../Frontend/src/app/features/public-business/public-business.component.ts) para generar `https://wa.me/<dígitos>` a partir del WhatsApp público normalizado.
- Implementar la consulta pública por slug; actualmente [`src/modules/public/adapters/http/public.controller.ts`](src/modules/public/adapters/http/public.controller.ts) responde que el perfil aún no está implementado.
- No devolver celular, WhatsApp personal, documento, fecha de nacimiento ni datos de autenticación del propietario en el endpoint público.
- Actualizar los modelos y vistas de administración para mostrar el WhatsApp de negocio con etiqueta propia, y mantener separado el teléfono del dueño. Revisar la tabla/exportación CSV y los detalles del tenant.

Archivos relacionados:

- [`src/modules/public/adapters/http/public.controller.ts`](src/modules/public/adapters/http/public.controller.ts)
- [`../Frontend/src/app/features/public-business/public-business.component.ts`](../Frontend/src/app/features/public-business/public-business.component.ts)
- [`../Frontend/src/app/features/platform-admin/platform-admin.models.ts`](../Frontend/src/app/features/platform-admin/platform-admin.models.ts)
- [`../Frontend/src/app/features/platform-admin/platform-admin.api.ts`](../Frontend/src/app/features/platform-admin/platform-admin.api.ts)
- [`../Frontend/src/app/features/platform-admin/platform-admin-new-tenant.component.ts`](../Frontend/src/app/features/platform-admin/platform-admin-new-tenant.component.ts)
- [`src/modules/admin/adapters/http/admin.controller.ts`](src/modules/admin/adapters/http/admin.controller.ts)

La creación manual de tenants desde administración es un flujo separado: el frontend ya envía `POST /admin/tenants`, pero el controlador revisado no implementa ese POST. Debe añadirse el campo y la persistencia también allí cuando se implemente ese endpoint, sin mezclar el WhatsApp de negocio con el teléfono del dueño.

### 7. Aplicar y verificar la migración de forma segura

- Añadir una migración nueva; no editar la migración inicial que ya pudo ejecutarse en producción.
- Ejecutar la migración en el entorno de staging primero y confirmar que registros existentes conservan `phone` y reciben `whatsapp = NULL`.
- Asegurar que el proceso de despliegue ejecuta migraciones de forma explícita y controlada antes de que el código dependa de la columna.
- Preparar rollback reversible y comprobar que el rollback no se ejecute si ya se capturaron datos que deban conservarse.
- No publicar valores reales de teléfono en logs, ejemplos, fixtures ni errores; limitar la exposición a usuarios autorizados.

## Pruebas y criterios de aceptación

### Backend

- DTO/controller: cuerpo anidado válido llega al servicio y ningún campo aceptado queda sin mapear.
- Rechazar estructura antigua/incompleta, slug inválido, teléfonos mal formados y tipos de negocio inválidos con `400` y detalle por campo.
- Persistir `location.whatsapp` en `platform_tenants.whatsapp`; mantener independiente `platform_tenants.phone`.
- Persistir los datos personales del dueño en la identidad central acordada, crear membership `owner` y no confiar en un `userId` arbitrario del cliente.
- Verificar transacción y reintento idempotente; un error no debe dejar un tenant medio creado.
- Validar que la migración sea aditiva, reversible y compatible con tenants existentes.
- Verificar que la consulta pública solo exponga los campos públicos y el endpoint administrativo muestre el WhatsApp esperado.

### Frontend

- Validar el WhatsApp en formato internacional y permitir omitirlo mientras sea opcional.
- Confirmar que el valor de la UI llega intacto y normalizado al cuerpo de onboarding.
- Mostrar celular personal y WhatsApp público en secciones/etiquetas diferentes en el resumen.
- Probar errores de validación, slug ocupado, reintento de creación, polling y estado de job fallido.
- Comprobar que el enlace del perfil público abre el chat con el número del negocio correcto y que no existe enlace cuando el dato está vacío.

### Flujo integrado

- Una inscripción completa crea el tenant, perfil de propietario, membership `owner` y job; al terminar, el cliente puede consultar el job y continuar.
- Repetir la solicitud con la misma clave idempotente no crea duplicados.
- Un tenant preexistente sin WhatsApp sigue visible y funcional.
- En administración, el WhatsApp público no aparece confundido con el celular del dueño.
- Probar staging con un número controlado antes de publicar; verificar las respuestas del API y la URL pública sin exponer los datos personales del propietario.

## Orden recomendado de entrega

1. Acordar el contrato y separar semánticamente WhatsApp personal y público.
2. Corregir contrato, validación, rutas y respuestas de onboarding.
3. Implementar asociación segura del usuario, tenant y membership; definir la persistencia del resto de bloques.
4. Añadir migración y guardar `platform_tenants.whatsapp`.
5. Actualizar formulario, resumen, administración y perfil público.
6. Ejecutar pruebas unitarias/integración, migración de staging y prueba manual de inscripción.
7. Desplegar backend y frontend coordinadamente; verificar la inscripción completa y luego producción.

## Criterio final

El trabajo está completo cuando el WhatsApp introducido en la ubicación de la barbería queda almacenado como contacto público del tenant, se devuelve explícitamente como `whatsapp`, aparece en el perfil público con enlace válido y no sustituye ni expone el celular/WhatsApp personal del propietario. También debe quedar demostrado que todos los campos del payload se validan, persisten o se rechazan con un error explícito.
