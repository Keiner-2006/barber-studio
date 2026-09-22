# Plan de Implementación: Registro de Negocio y Personalización — Navaja Studio OS

## 1. Objetivo

La landing page no debe presentarse como si fuera una barbería individual. Debe comunicar que el producto es un software SaaS para que barberías y negocios de grooming:

- Registren su empresa.
- Configuren una o varias sucursales.
- Personalicen su presencia pública.
- Administren servicios, barberos, clientes, turnos, inventario y caja.
- Permitan que sus propios clientes reserven citas.

La plataforma tiene dos niveles claramente separados:

1. **Plataforma SaaS:** usuarios que registran y administran negocios.
2. **Negocio/tenant:** la barbería que gestiona sus operaciones y los clientes que atiende.

No se deben mezclar los clientes de la plataforma con los clientes de cada barbería.

---

## 2. Experiencia inicial de la landing page

### Mensaje principal

Propuesta recomendada:

> Administra tu barbería. Llena tus sillas. Haz crecer tu negocio.

Subtexto:

> Navaja Studio OS reúne reservas, clientes, equipo, inventario y caja en un solo lugar para barberías modernas.

Acciones principales:

- `Crear mi negocio` — inicia onboarding.
- `Ver cómo funciona` — muestra una visita guiada o demo.
- `Iniciar sesión` — para negocios ya registrados.

### Secciones de la landing

1. Hero con propuesta de valor y CTA.
2. Beneficios: reservas, operación, clientes e inventario.
3. Flujo visual en tres pasos: registra, configura, administra.
4. Capturas o mockups del dashboard.
5. Comparación entre operación manual y operación centralizada.
6. Testimonios o casos de uso.
7. Preguntas frecuentes sobre sucursales, usuarios y reservas.
8. CTA final: `Registra tu negocio gratis`.

La landing pública debe usar la marca de la plataforma. La página pública de cada barbería debe usar la marca personalizada del tenant.

---

## 3. Flujo de registro del negocio

### Paso 0: entrada

Ruta: `/registrar-negocio`

El CTA de la landing abre un registro progresivo. No pedir toda la información en un solo formulario.

### Paso 1: cuenta del propietario

Campos:

- Nombre completo.
- Correo electrónico.
- Contraseña.
- Confirmación de contraseña.
- Aceptación de términos y privacidad.

Reglas:

- Email normalizado y único en la plataforma.
- Contraseña procesada exclusivamente por Better Auth.
- Mensajes de error genéricos para no revelar si un email existe.
- Verificación de email preparada aunque inicialmente no se envíe correo.

### Paso 2: información del negocio

Campos:

- Nombre comercial.
- Razón social opcional.
- Tipo de negocio: barbería, peluquería, estudio de grooming u otro.
- País.
- Ciudad.
- Moneda.
- Zona horaria.
- Teléfono.
- Slug público.

El slug debe validarse en tiempo real y generar una URL pública similar a:

`/b/nombre-del-negocio`

En el futuro puede mapearse a un subdominio:

`nombre-del-negocio.app.navaja.com`

### Paso 3: primera sucursal

Campos:

- Nombre de sucursal.
- Dirección.
- Teléfono.
- Horario semanal.
- Días no laborables.
- Capacidad aproximada.

La primera sucursal se crea automáticamente como `main branch`. El negocio puede agregar otras sucursales después.

### Paso 4: identidad visual

Campos:

- Logo.
- Foto principal del negocio.
- Galería opcional.
- Color primario.
- Color secundario opcional.
- Descripción corta.
- Enlaces sociales opcionales.

Este paso debe poder omitirse y completarse desde configuración.

### Paso 5: configuración inicial

Ofrecer plantillas rápidas:

- Barbería clásica.
- Barbería premium.
- Grooming express.
- Configuración manual.

Según la plantilla se proponen servicios, duraciones y precios, pero el usuario debe confirmar antes de guardarlos. Nunca presentar datos demo como datos reales.

### Paso 6: finalización

Mostrar un resumen:

- Negocio.
- Sucursal.
- Zona horaria y moneda.
- URL pública.
- Servicios iniciales.

Al confirmar:

1. Crear tenant en la base central.
2. Crear job de aprovisionamiento.
3. Crear base PostgreSQL dedicada.
4. Ejecutar migraciones.
5. Crear owner, sucursal y configuración.
6. Subir o asociar assets.
7. Crear servicios iniciales si fueron seleccionados.
8. Activar tenant solo después del health check.
9. Redirigir al onboarding del dashboard.

Si falla el aprovisionamiento, mostrar estado recuperable y permitir reintentar sin crear otro negocio.

---

## 4. Modelo de datos necesario

### Base central de plataforma

Agregar o confirmar:

#### `platform_tenants`

- `id`
- `legal_name`
- `trade_name`
- `slug`
- `business_type`
- `country_code`
- `city`
- `timezone`
- `currency_code`
- `phone`
- `status`
- `database_secret_ref`
- `created_at`
- `updated_at`

#### `platform_users`

- `id`
- `name`
- `email`
- `status`
- `created_at`
- `updated_at`

#### `platform_memberships`

- `id`
- `tenant_id`
- `user_id`
- `role`
- `status`
- `created_at`

Roles iniciales:

- `owner`
- `admin`
- `reception`
- `barber`
- `inventory_manager`
- `accountant`

#### `tenant_branding`

- `tenant_id`
- `logo_url`
- `cover_image_url`
- `gallery_urls` JSONB
- `primary_color`
- `secondary_color`
- `accent_color`
- `description`
- `social_links` JSONB
- `public_booking_enabled`
- `updated_at`

#### `tenant_media_assets`

- `id`
- `tenant_id`
- `provider`
- `provider_asset_id`
- `url`
- `secure_url`
- `resource_type`
- `width`
- `height`
- `alt_text`
- `purpose`
- `created_at`

El `provider_asset_id` permite eliminar o reemplazar archivos en Cloudinary sin guardar credenciales en la base operativa.

### Base operativa del tenant

#### `customers`

Estos son los clientes que visitan la barbería, no los usuarios dueños del software.

- `id`
- `branch_id` opcional si el cliente está asociado a una sucursal
- `full_name`
- `email`
- `phone`
- `birth_date` opcional
- `notes` protegidas por permisos
- `preferences` JSONB
- `marketing_consent`
- `created_at`
- `updated_at`
- `archived_at`

Reglas:

- Buscar por teléfono y email normalizados.
- Evitar duplicados dentro del tenant.
- Permitir un cliente frecuente en varias sucursales.
- Registrar quién creó o modificó información sensible.
- No exponer notas internas en la página pública.

#### `customer_consents`

Para separar consentimiento de marketing, privacidad y comunicaciones:

- `id`
- `customer_id`
- `type`
- `granted`
- `source`
- `granted_at`
- `revoked_at`

#### `customer_visit_summary`

Puede ser una vista o tabla materializada para mostrar:

- Número de visitas.
- Última visita.
- Gasto acumulado.
- Servicio favorito.
- Profesional habitual.

La fuente de verdad debe seguir siendo reservas y pagos registrados.

---

## 5. Cloudinary para imágenes

### Decisión

Usar Cloudinary para logo, portada, galería e imágenes públicas del negocio. No almacenar imágenes binarias en PostgreSQL ni en el repositorio.

### Flujo seguro recomendado

1. El frontend solicita al backend un upload signature.
2. Next.js valida sesión, tenant y propósito del archivo.
3. El backend genera una firma temporal usando variables privadas de Cloudinary.
4. Angular sube directamente a Cloudinary.
5. Cloudinary devuelve `public_id`, `secure_url`, dimensiones y formato.
6. Angular envía esos metadatos al backend.
7. El backend valida que el asset pertenezca al tenant y guarda la referencia.

No exponer `api_secret` al navegador.

### Configuración de carpetas

Usar una estructura estable:

```text
navaja/{tenantId}/branding/logo
navaja/{tenantId}/branding/cover
navaja/{tenantId}/branding/gallery
navaja/{tenantId}/services/{serviceId}
```

### Validaciones

- Aceptar JPG, PNG y WebP.
- Rechazar SVG no sanitizado.
- Limitar tamaño de archivo.
- Validar MIME real, no solo extensión.
- Transformar automáticamente a WebP/AVIF cuando sea conveniente.
- Generar thumbnails responsivos.
- Mantener `alt_text` obligatorio para imágenes informativas.
- Borrar assets huérfanos mediante job periódico.

### Variables necesarias

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Estas variables deben configurarse mediante una integración o variables seguras del proyecto. Nunca deben aparecer en Angular ni en respuestas de API.

### Alternativa

Si el producto prioriza integración nativa con Vercel, Blob puede ser más simple para un MVP. Cloudinary es mejor cuando se requieren transformaciones, optimización, thumbnails, crop focal y galerías públicas.

---

## 6. Sistema de colores y personalización

### Separar dos sistemas

1. **Marca de Navaja:** landing, login, onboarding y elementos del producto.
2. **Marca del negocio:** página pública de reserva y perfil público de la barbería.

El dashboard administrativo debe conservar tokens de contraste de la plataforma para no romper legibilidad. La personalización completa debe aplicarse principalmente a la página pública del negocio.

### Configuración recomendada

El usuario elige un color primario, pero el sistema genera automáticamente:

- `primary`
- `primary-foreground`
- `primary-hover`
- `surface-tint`
- `focus-ring`

Validar contraste WCAG AA. Si el color elegido no cumple, ofrecer una variante corregida y explicar el motivo.

No permitir que el usuario configure libremente colores de texto, fondo o estados semánticos críticos. Éxito, error, advertencia e información deben conservar significado accesible.

### Plantillas visuales

Ofrecer presets para reducir fricción:

- Carbón y cobre.
- Marfil y verde profundo.
- Azul noche y dorado.
- Terracota y crema.

El cambio debe verse en preview antes de guardar.

---

## 7. Página pública del negocio

Ruta sugerida: `/b/[slug]`

Contenido:

- Logo y foto de portada.
- Nombre comercial y descripción.
- Ubicación y sucursales.
- Horarios.
- Servicios filtrables por categoría.
- Precio, duración y política de reserva.
- Equipo disponible.
- Botón `Reservar cita`.
- Galería optimizada.
- Contacto y redes.

La página pública solo debe leer datos publicados y activos. Nunca debe revelar inventario, caja, notas internas, datos privados de clientes o información de otras sucursales.

Si se permite reserva pública sin cuenta, pedir nombre y teléfono/email y crear o vincular un `customer` dentro del tenant. La identidad del cliente final debe estar separada de la cuenta administrativa.

---

## 8. Cliente final de la barbería

El primer MVP puede permitir reservar sin crear contraseña. El cliente proporciona:

- Nombre.
- Teléfono.
- Email opcional.
- Servicio.
- Sucursal.
- Profesional opcional.
- Horario.
- Consentimientos.

Más adelante se puede agregar portal del cliente con enlace mágico, pero no debe bloquear la reserva inicial.

Cuando el cliente vuelve:

1. El backend busca coincidencia por teléfono/email normalizado.
2. Si existe, reutiliza el perfil del tenant.
3. Si hay ambigüedad, recepción debe resolverla manualmente.
4. Nunca fusionar perfiles automáticamente sin suficiente confianza.

---

## 9. API y endpoints

### Onboarding

- `POST /v1/onboarding/tenants`
- `GET /v1/onboarding/{jobId}`
- `POST /v1/onboarding/{jobId}/retry`
- `GET /v1/tenants/me`
- `PATCH /v1/tenants/me`

### Branding y media

- `GET /v1/branding`
- `PATCH /v1/branding`
- `POST /v1/media/signature`
- `POST /v1/media/assets`
- `DELETE /v1/media/assets/{id}`

### Clientes del negocio

- `GET /v1/customers`
- `POST /v1/customers`
- `GET /v1/customers/{id}`
- `PATCH /v1/customers/{id}`
- `POST /v1/customers/{id}/archive`
- `GET /v1/customers/{id}/history`

### Página pública

- `GET /v1/public/businesses/{slug}`
- `GET /v1/public/businesses/{slug}/services`
- `GET /v1/public/businesses/{slug}/availability`
- `POST /v1/public/businesses/{slug}/appointments`

La reserva pública debe usar rate limiting, validación anti-spam e idempotency key.

---

## 10. Seguridad y privacidad

- El tenant se obtiene de la sesión, nunca del body.
- Toda consulta operativa debe ejecutarse contra la base del tenant correcto.
- Los administradores solo acceden a sucursales autorizadas.
- Los clientes finales solo pueden ver sus propios datos mediante un mecanismo seguro futuro.
- Las URLs firmadas o tokens temporales deben expirar.
- Auditar exportaciones y consultas de clientes.
- Enmascarar teléfono/email en logs.
- No permitir que una URL pública enumere clientes.
- Definir retención, exportación y borrado de datos personales.
- Preparar cumplimiento de legislación local de privacidad.

---

## 11. Fases de implementación

### Fase 1: foundation

- Landing orientada al SaaS.
- Rutas de registro, login y recuperación.
- Modelo central de tenant y memberships.
- Onboarding por pasos.
- Estados de aprovisionamiento.

### Fase 2: tenant activo

- Dashboard basado en sesión.
- Selector de sucursal.
- Configuración de negocio y branding.
- Primera sucursal, horarios y servicios.
- Página pública por slug.

### Fase 3: clientes y reservas

- CRUD de clientes del tenant.
- Historial de visitas.
- Catálogo público.
- Disponibilidad y reservas públicas.
- Prevención de doble reserva.

### Fase 4: imágenes

- Integración Cloudinary.
- Firma de uploads.
- Galería, logo y portada.
- Transformaciones y limpieza de huérfanos.

### Fase 5: operación

- Barberos y permisos.
- Inventario por sucursal.
- Caja y pagos manuales.
- Reportes y auditoría.

### Fase 6: calidad y lanzamiento

- E2E de onboarding completo.
- Pruebas de aislamiento multi-tenant.
- Pruebas de accesibilidad.
- Rate limiting y protección anti-spam.
- Backups, observabilidad y recuperación.

---

## 12. Criterios de aceptación

- Un usuario puede registrar un negocio sin intervención manual.
- El sistema no duplica tenants si el usuario reintenta el formulario.
- El tenant queda inactivo hasta completar el aprovisionamiento.
- El owner puede crear sucursales y configurar servicios.
- El negocio puede cargar logo y portada sin exponer secretos de Cloudinary.
- La página pública muestra solo información publicada de ese negocio.
- Un cliente final puede reservar y queda registrado dentro del tenant correcto.
- Dos negocios nunca comparten clientes, citas, inventario ni archivos por error.
- La configuración de colores mantiene contraste accesible.
- El dashboard administra clientes de la barbería, no usuarios globales de la plataforma.
- Los errores de aprovisionamiento son reintentables y auditables.

---

## 13. Decisiones recomendadas

1. Mantener PostgreSQL independiente por tenant para respetar la decisión de aislamiento.
2. Mantener una base central de plataforma para identidad, tenants y aprovisionamiento.
3. Usar Cloudinary si la galería y transformación de imágenes son parte importante del producto; usar Blob si solo se requieren archivos simples.
4. Permitir reserva pública sin cuenta en el primer MVP.
5. Mantener la marca del SaaS en el producto administrativo y aplicar branding del negocio principalmente en la página pública.
6. Crear clientes finales dentro de cada tenant, con historial y consentimiento separados de los usuarios administrativos.
7. Implementar primero onboarding, branding, clientes y reservas antes de pagos online o automatizaciones de marketing.

---

## 14. Información que falta confirmar

- Nombre definitivo de la plataforma.
- Países iniciales y moneda por defecto.
- Proveedor definitivo de imágenes: Cloudinary o Blob.
- Si la página pública usará subruta, subdominio o dominio personalizado.
- Si se permitirá reservar sin cuenta.
- Política de privacidad y retención de clientes.
- Tamaño máximo y cantidad de imágenes por negocio.
- Si los clientes pueden pertenecer a varias sucursales.
- Si los precios incluyen impuestos o los agregan al final.
- Si el registro será gratuito, prueba limitada o plan pagado.
