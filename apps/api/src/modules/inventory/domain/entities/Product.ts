export interface ProductProps {
  id: string
  tenantId: string
  name: string
  sku: string
  description: string | null
  category: string | null
  unit: string
  unitCost: string
  suggestedPrice: string | null
  minQuantity: number
  active: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class Product {
  constructor(private readonly props: ProductProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get name() { return this.props.name }
  get sku() { return this.props.sku }
  get description() { return this.props.description }
  get category() { return this.props.category }
  get unit() { return this.props.unit }
  get unitCost() { return this.props.unitCost }
  get suggestedPrice() { return this.props.suggestedPrice }
  get minQuantity() { return this.props.minQuantity }
  get active() { return this.props.active }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get deletedAt() { return this.props.deletedAt }

  get unitCostNumber(): number {
    return parseFloat(this.props.unitCost)
  }

  isActive(): boolean {
    return this.props.active && this.props.deletedAt === null
  }

  isLowStock(quantity: number): boolean {
    return quantity <= this.props.minQuantity
  }

  toPlain(): ProductProps {
    return { ...this.props }
  }

  static fromPlain(props: ProductProps): Product {
    return new Product(props)
  }
}