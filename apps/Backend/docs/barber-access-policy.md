# Acceso del barbero

El rol efectivo viene de una membresía activa de `platform_memberships` en un negocio activo. Los roles locales de `user_roles` sirven como datos del personal; no elevan los permisos de la sesión. Un propietario que también presta servicios conserva su acceso de propietario.

Un barbero necesita un usuario local activo del mismo negocio y exactamente un perfil de personal activo. La sesión de Better Auth se vincula al usuario local por correo y negocio; su identificador no se usa como identificador local. Si falta el perfil o es ambiguo se rechaza el acceso.

| Recurso | Política |
|---|---|
| Agenda y disponibilidad | Solo el perfil propio, incluso al enviar otro `staffId` manualmente |
| Citas | Solo las asignadas al barbero dentro del negocio |
| Avance del servicio | `checked_in → in_service → completed`; permite notas en citas abiertas |
| Recepción | No permite confirmar, cancelar, marcar inasistencia, reabrir, reasignar o mover citas |
| Clientes | Solo nombres de clientes con citas asignadas; sin contacto, documentos, consentimientos ni datos financieros |
| Catálogo | Consulta de servicios y precios |
| Caja y pagos | Sin consulta ni operaciones, incluidos los pagos de una cita |
| Administración | Sin personal, inventario, compras, reportes financieros ni configuración |

Las actualizaciones de citas del barbero verifican negocio, asignación y estado bajo bloqueo de fila dentro de una transacción. Las rutas que usan `PermissionsGuard` sin declarar permisos se rechazan para este rol.

`GET /tenants/me` devuelve `role`, `permissions` y `staffId`. El frontend utiliza el perfil devuelto por el servidor y dirige al barbero a `/agenda`; el resumen administrativo no está permitido. Ocultar opciones de navegación complementa las restricciones de la API.

Validación: `npm run typecheck`, `npm test -- --runInBand` y `npm run build`. Las pruebas cubren denegación de caja/pagos, administración, acceso a perfiles ajenos, clientes asignados, transiciones y resolución del perfil local.

Estos cambios requieren publicar el backend y el frontend para afectar a la plataforma en producción. No se necesita modificar roles ni contraseñas de los usuarios creados.
