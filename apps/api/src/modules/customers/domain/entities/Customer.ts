export interface CustomerProps {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  document: string | null
  notes: string | null
  preferences: Record<string, any> | null
  consents: Record<string, any> | null
  totalVisits: string
  totalSpent: string
  currency: string
  lastVisitAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class Customer {
  constructor(private readonly props: CustomerProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get firstName() { return this.props.firstName }
  get lastName() { return this.props.lastName }
  get email() { return this.props.email }
  get phone() { return this.props.phone }
  get document() { return this.props.document }
  get notes() { return this.props.notes }
  get preferences() { return this.props.preferences }
  get consents() { return this.props.consents }
  get totalVisits() { return this.props.totalVisits }
  get totalSpent() { return this.props.totalSpent }
  get currency() { return this.props.currency }
  get lastVisitAt() { return this.props.lastVisitAt }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get deletedAt() { return this.props.deletedAt }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`.trim()
  }

  get totalVisitsNumber(): number {
    return parseInt(this.props.totalVisits, 10) || 0
  }

  get totalSpentNumber(): number {
    return parseFloat(this.props.totalSpent) || 0
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  toPlain(): CustomerProps {
    return { ...this.props }
  }

  static fromPlain(props: CustomerProps): Customer {
    return new Customer(props)
  }
}