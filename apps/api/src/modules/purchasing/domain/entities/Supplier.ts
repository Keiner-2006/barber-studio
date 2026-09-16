export interface SupplierProps {
  id: string
  tenantId: string
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class Supplier {
  constructor(private readonly props: SupplierProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get name() { return this.props.name }
  get contactName() { return this.props.contactName }
  get email() { return this.props.email }
  get phone() { return this.props.phone }
  get address() { return this.props.address }
  get notes() { return this.props.notes }
  get active() { return this.props.active }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get deletedAt() { return this.props.deletedAt }

  isActive(): boolean {
    return this.props.active && this.props.deletedAt === null
  }

  toPlain(): SupplierProps {
    return { ...this.props }
  }

  static fromPlain(props: SupplierProps): Supplier {
    return new Supplier(props)
  }
}