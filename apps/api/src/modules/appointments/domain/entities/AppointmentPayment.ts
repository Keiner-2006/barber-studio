export type PaymentMethod = 'cash' | 'card_manual' | 'transfer_manual' | 'other'
export type PaymentStatus = 'pending' | 'recorded' | 'refunded' | 'voided'

export interface AppointmentPaymentProps {
  id: string
  tenantId: string
  appointmentId: string
  amount: string
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  reference?: string | null
  recordedBy?: string | null
  createdAt: Date
  updatedAt: Date
}

export class AppointmentPayment {
  constructor(private readonly props: AppointmentPaymentProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get appointmentId() { return this.props.appointmentId }
  get amount() { return this.props.amount }
  get currency() { return this.props.currency }
  get method() { return this.props.method }
  get status() { return this.props.status }
  get reference() { return this.props.reference }
  get recordedBy() { return this.props.recordedBy }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  get amountNumber(): number {
    return parseFloat(this.props.amount)
  }

  isRecorded(): boolean {
    return this.props.status === 'recorded'
  }

  isRefunded(): boolean {
    return this.props.status === 'refunded'
  }

  record(): AppointmentPayment {
    if (this.props.status !== 'pending') {
      throw new Error('Payment already processed')
    }
    return new AppointmentPayment({ ...this.props, status: 'recorded' })
  }

  refund(): AppointmentPayment {
    if (this.props.status !== 'recorded') {
      throw new Error('Only recorded payments can be refunded')
    }
    return new AppointmentPayment({ ...this.props, status: 'refunded' })
  }

  toPlain(): AppointmentPaymentProps {
    return { ...this.props }
  }

  static fromPlain(props: AppointmentPaymentProps): AppointmentPayment {
    return new AppointmentPayment(props)
  }
}