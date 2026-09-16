export type PaymentPolicy = 'none' | 'deposit' | 'full'
export type DepositType = 'fixed' | 'percentage'

export interface ServiceProps {
  id: string
  tenantId: string
  categoryId: string
  name: string
  description: string | null
  durationMinutes: number
  priceBase: string
  currency: string
  paymentPolicy: PaymentPolicy
  depositType: DepositType | null
  depositValue: string | null
  cancellationMinutes: number | null
  active: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export class Service {
  constructor(private readonly props: ServiceProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get categoryId() { return this.props.categoryId }
  get name() { return this.props.name }
  get description() { return this.props.description }
  get durationMinutes() { return this.props.durationMinutes }
  get priceBase() { return this.props.priceBase }
  get currency() { return this.props.currency }
  get paymentPolicy() { return this.props.paymentPolicy }
  get depositType() { return this.props.depositType }
  get depositValue() { return this.props.depositValue }
  get cancellationMinutes() { return this.props.cancellationMinutes }
  get active() { return this.props.active }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get deletedAt() { return this.props.deletedAt }

  get priceNumber(): number {
    return parseFloat(this.props.priceBase)
  }

  requiresDeposit(): boolean {
    return this.props.paymentPolicy === 'deposit' || this.props.paymentPolicy === 'full'
  }

  isActive(): boolean {
    return this.props.active && this.props.deletedAt === null
  }

  toPlain(): ServiceProps {
    return { ...this.props }
  }

  static fromPlain(props: ServiceProps): Service {
    return new Service(props)
  }
}