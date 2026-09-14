export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  APP: 'app',
  RECEPTION: 'reception',
  BARBER: 'barber',
  INVENTORY_MANAGER: 'inventory_manager',
  ACCOUNTANT: 'accountant',
  CUSTOMER: 'customer',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  app: 'Usuario de aplicación',
  reception: 'Recepción',
  barber: 'Barbero',
  inventory_manager: 'Gerente de Inventario',
  accountant: 'Contador',
  customer: 'Cliente',
}
