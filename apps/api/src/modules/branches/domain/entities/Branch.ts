export type BranchStatus = 'active' | 'inactive'

export interface BranchProps {
  id: string
  tenantId: string
  code: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  phone: string | null
  timezone: string | null
  status: BranchStatus
  operatingHours: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
}

export class Branch {
  constructor(private readonly props: BranchProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get code() { return this.props.code }
  get name() { return this.props.name }
  get address() { return this.props.address }
  get city() { return this.props.city }
  get state() { return this.props.state }
  get country() { return this.props.country }
  get postalCode() { return this.props.postalCode }
  get phone() { return this.props.phone }
  get timezone() { return this.props.timezone }
  get status() { return this.props.status }
  get operatingHours() { return this.props.operatingHours }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  isActive(): boolean {
    return this.props.status === 'active'
  }

  activate(): Branch {
    return new Branch({ ...this.props, status: 'active' })
  }

  deactivate(): Branch {
    return new Branch({ ...this.props, status: 'inactive' })
  }

  toPlain(): BranchProps {
    return { ...this.props }
  }

  static fromPlain(props: BranchProps): Branch {
    return new Branch(props)
  }
}