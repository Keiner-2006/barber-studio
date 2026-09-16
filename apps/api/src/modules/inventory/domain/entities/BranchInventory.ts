export interface BranchInventoryProps {
  id: string
  tenantId: string
  branchId: string
  productId: string
  quantity: string
  reserved: string
  averageCost: string
  updatedAt: Date
}

export class BranchInventory {
  constructor(private readonly props: BranchInventoryProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get branchId() { return this.props.branchId }
  get productId() { return this.props.productId }
  get quantity() { return this.props.quantity }
  get reserved() { return this.props.reserved }
  get averageCost() { return this.props.averageCost }
  get updatedAt() { return this.props.updatedAt }

  get quantityNumber(): number {
    return parseFloat(this.props.quantity)
  }

  get reservedNumber(): number {
    return parseFloat(this.props.reserved)
  }

  get availableQuantity(): number {
    return this.quantityNumber - this.reservedNumber
  }

  get totalValue(): number {
    return this.quantityNumber * parseFloat(this.props.averageCost)
  }

  canReserve(quantity: number): boolean {
    return this.availableQuantity >= quantity
  }

  toPlain(): BranchInventoryProps {
    return { ...this.props }
  }

  static fromPlain(props: BranchInventoryProps): BranchInventory {
    return new BranchInventory(props)
  }
}