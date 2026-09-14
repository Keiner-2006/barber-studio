export const INVENTORY_MOVEMENT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  ADJUSTMENT: 'adjustment',
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
  CONSUMPTION: 'consumption',
  RETURN: 'return',
} as const

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[keyof typeof INVENTORY_MOVEMENT_TYPES]

export const INVENTORY_MOVEMENT_TYPE_LABELS: Record<InventoryMovementType, string> = {
  purchase: 'Compra',
  sale: 'Venta',
  adjustment: 'Ajuste',
  transfer_in: 'Transferencia entrada',
  transfer_out: 'Transferencia salida',
  consumption: 'Consumo',
  return: 'Devolución',
}
