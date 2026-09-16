# Especificación del frontend Angular

## 1. Principios

Angular es una aplicación independiente que consume la API Next.js. La experiencia debe sentirse como una herramienta premium de operación, pero mantener reservas simples para clientes móviles. Mobile-first en el flujo público y desktop-first en backoffice.

Principios: claridad antes que densidad, progressive disclosure, feedback inmediato, prevención de errores, estados vacíos útiles, accesibilidad WCAG 2.2 AA, navegación por teclado, foco visible, contraste suficiente y lenguaje regional configurable.

## 2. Estructura

```text
src/app/
  core/                 # auth, http, rbac (role-resolver, tenant-context, request-context, auth guard, rate limiting)
  layout/               # public shell, app shell, navigation, command menu
  shared/               # buttons, dialogs, tables, charts, date/currency pipes
  features/
    booking/
      booking.models.ts   # tipos, enums y constantes del dominio
      booking.api.ts      # llamadas HTTP tipadas
      booking.store.ts    # signals de estado y lógica reactiva
      booking.component.ts
    dashboard/
      dashboard.models.ts
      dashboard.api.ts
      dashboard.store.ts
      dashboard.component.ts
    agenda/
      agenda.models.ts
      agenda.api.ts
      agenda.store.ts
      agenda.component.ts
    customers/
    catalog/
    inventory/
    purchasing/
    cash/
    reports/
      reports.models.ts
      reports.api.ts
      reports.store.ts
      reports.component.ts
      reports.routes.ts
      components/
        bar-chart.component.ts
        horizontal-bar-chart.component.ts
    settings/
```

Usar standalone components, lazy routes, formularios reactivos, signals para estado local y un store por feature siguiendo el patrón `models → api → store → ui`. DTOs y enums se generan o validan desde el contrato OpenAPI; no duplicar reglas de dominio en templates.

## 3. Shell, sesión y alcance

El `AppShell` contiene navegación lateral en desktop, barra superior con empresa/sucursal, búsqueda rápida y perfil. El cliente usa `PublicShell` sin datos de otras sucursales. Guards: `authGuard`, `roleGuard`, `branchScopeGuard`; interceptors agregan sesión, request id y manejo uniforme de 401/403.

El selector de sucursal es persistente en memoria/URL, no en localStorage como fuente de verdad. Al cambiar sucursal se limpian queries y se muestra contexto visible. Todos los permisos se reflejan visualmente, pero la autorización real pertenece al backend.

Los guards están centralizados en `core/rbac/`: `role-resolver.ts` resuelve roles del usuario, `tenant-context.ts` y `request-context.ts` encapsulan contexto, `auth.guard.ts` protege rutas verificando autenticación + roles requeridos (definidos en `data: { roles: [...] }` por ruta), y un interceptor aplica rate limiting por request.

## 4. Flujos principales

### Descubrimiento y reserva

1. Landing de la barbería: propuesta, fotos reales, servicios destacados, reseñas y sucursales.
2. Catálogo con tarjetas de servicio: nombre, duración, precio, descripción breve y política de pago.
3. Selección de sucursal y, opcionalmente, barbero por perfil/estilo.
4. Calendario con slots disponibles, timezone y alternativa de “primer horario disponible”.
5. Resumen con servicio, profesional, sucursal, duración, precio, anticipo o pago requerido según configuración.
6. Formulario de cliente y consentimiento.
7. Confirmación con código de reserva, política de cancelación y acciones de calendario.

La UI deshabilita slots vencidos, muestra estados de actualización y ante 409 conserva la selección para ofrecer horarios cercanos. Nunca confirma visualmente hasta recibir respuesta del backend.

### Recepción y agenda

Calendario día/semana con vista por barbero, filtros por sucursal/estado, drag-and-drop opcional con confirmación, check-in, iniciar, completar, cancelar y no-show. Los cambios muestran toast accesible y registro de actividad.

### Barbero

Vista “Mi día” con próximos turnos, ficha de cliente, notas permitidas, servicios realizados y bloqueo de disponibilidad. El barbero no ve caja ni inventario salvo permisos.

### Administrador

Dashboard con ocupación, ingresos, ticket promedio, servicios populares, stock bajo y diferencias de caja. Tarjetas accionables, filtros por periodo/sucursal y exportación protegida.

### Inventario, compras y caja

Inventario: búsqueda SKU, existencia por sucursal, mínimos, movimientos y transferencias. Compras: proveedor, orden, recepción parcial y costos. Caja: apertura, ventas/pagos manuales, gastos, cierre, arqueo y diferencia; transacciones conciliadas son inmutables y se revierten.

## 5. Componentes reutilizables

`ServiceCard`, `BranchPicker`, `StaffProfileCard`, `AvailabilityCalendar`, `BookingSummary`, `AppointmentStatusBadge`, `AgendaGrid`, `CustomerDrawer`, `InventoryTable`, `StockAlert`, `PurchaseOrderForm`, `CashSessionPanel`, `MetricCard`, `BarChart`, `HorizontalBarChart`, `DataTable`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `SkeletonTable` y `AuditTimeline`.

Cada componente debe tener estados loading, vacío, error, disabled y success cuando aplique. Tablas densas ofrecen vista de tarjetas en móvil; formularios largos usan pasos y resumen lateral.

## 6. Lenguaje visual

Dirección: barbería contemporánea, sobria y cálida, sin clichés. Paleta limitada a 4–5 tokens: carbón profundo, marfil/neutral claro, gris intermedio, cobre como acento primario y un verde semántico para confirmaciones. El cobre se reserva para acciones y selección; no usar gradientes decorativos.

Tipografía: una sans de alta legibilidad para cuerpo y una serif o display sobria únicamente para titulares, máximo dos familias. Radios moderados, bordes suaves, sombras discretas y espacio generoso. Los estados se comunican con texto e iconos, no solo color.

## 7. Datos, errores y rendimiento

`ApiClient` tipado centraliza requests. El patrón `models → api → store → ui` separa tipos, llamadas HTTP, lógica reactiva y presentación por feature. Usar caching de disponibilidad con expiración corta, invalidar al reservar y cancelar, debounce en búsquedas, paginación server-side y lazy loading de rutas. No hacer fetch dentro de efectos sin control; los streams/signals deben modelar loading y error explícitamente.

Errores de validación se muestran junto al campo. 401 redirige preservando return URL; 403 explica permisos; 409 de reserva propone alternativas; 500 ofrece reintento y request id. Nunca exponer detalles técnicos.

## 8. Accesibilidad y responsive

Semántica HTML, labels asociados, `aria-live` para confirmaciones, foco gestionado en diálogos, teclado completo para calendario/tablas, targets táctiles de al menos 44px, contraste AA y respeto a reduced motion. Reservar debe poder hacerse con una mano en móvil; la agenda operativa debe conservar legibilidad a 1024px o más.

## 9. Pruebas

Unitarias de pipes, validadores, guards y componentes. Component tests para disponibilidad, resumen de pago, conflictos, cambio de sucursal y permisos. E2E para cliente reserva, recepción confirma/check-in, barbero completa, inventario recibe compra y caja cierra. Pruebas de accesibilidad automatizadas y revisión manual de teclado.

## 10. Decisiones abiertas

Definir sistema de diseño final, proveedor de imágenes, estrategia de generación de cliente OpenAPI, analítica respetuosa de privacidad, idioma adicional, impresión de recibos y futura integración de pagos/notificaciones. Confirmar reglas de cancelación, redondeo de impuestos y si el cliente puede elegir profesional siempre.
