export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface AppointmentProps {
  id: string
  tenantId: string
  branchId: string
  customerId: string
  staffId: string
  serviceId: string
  startsAt: Date
  endsAt: Date
  serviceNameSnapshot: string
  serviceDurationSnapshot: number
  priceSnapshot: string
  currencySnapshot: string
  status: AppointmentStatus
  source?: string | null
  notes?: string | null
  cancellationReason?: string | null
  idempotencyKey?: string | null
  createdAt: Date
  updatedAt: Date
}

export class Appointment {
  constructor(private readonly props: AppointmentProps) {}

  get id() { return this.props.id }
  get tenantId() { return this.props.tenantId }
  get branchId() { return this.props.branchId }
  get customerId() { return this.props.customerId }
  get staffId() { return this.props.staffId }
  get serviceId() { return this.props.serviceId }
  get startsAt() { return this.props.startsAt }
  get endsAt() { return this.props.endsAt }
  get serviceNameSnapshot() { return this.props.serviceNameSnapshot }
  get serviceDurationSnapshot() { return this.props.serviceDurationSnapshot }
  get priceSnapshot() { return this.props.priceSnapshot }
  get currencySnapshot() { return this.props.currencySnapshot }
  get status() { return this.props.status }
  get source() { return this.props.source }
  get notes() { return this.props.notes }
  get cancellationReason() { return this.props.cancellationReason }
  get idempotencyKey() { return this.props.idempotencyKey }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  get total(): number {
    return parseFloat(this.props.priceSnapshot)
  }

  get durationMinutes(): number {
    return this.props.serviceDurationSnapshot
  }

  canConfirm(): boolean {
    return this.props.status === 'pending'
  }

  canCancel(): boolean {
    return ['pending', 'confirmed'].includes(this.props.status)
  }

  canCheckIn(): boolean {
    return this.props.status === 'confirmed'
  }

  canComplete(): boolean {
    return ['checked_in', 'in_service'].includes(this.props.status)
  }

  confirm(): Appointment {
    if (!this.canConfirm()) {
      throw new Error('Cannot confirm appointment in current status')
    }
    return new Appointment({ ...this.props, status: 'confirmed' })
  }

  cancel(reason?: string): Appointment {
    if (!this.canCancel()) {
      throw new Error('Cannot cancel appointment in current status')
    }
    return new Appointment({
      ...this.props,
      status: 'cancelled',
      cancellationReason: reason ?? null,
    })
  }

  checkIn(): Appointment {
    if (!this.canCheckIn()) {
      throw new Error('Cannot check in appointment in current status')
    }
    return new Appointment({ ...this.props, status: 'checked_in' })
  }

  startService(): Appointment {
    if (!this.canCheckIn()) {
      throw new Error('Cannot start service in current status')
    }
    return new Appointment({ ...this.props, status: 'in_service' })
  }

  complete(): Appointment {
    if (!this.canComplete()) {
      throw new Error('Cannot complete appointment in current status')
    }
    return new Appointment({ ...this.props, status: 'completed' })
  }

  markNoShow(): Appointment {
    return new Appointment({ ...this.props, status: 'no_show' })
  }

  toPlain(): AppointmentProps {
    return { ...this.props }
  }

  static fromPlain(props: AppointmentProps): Appointment {
    return new Appointment(props)
  }
}