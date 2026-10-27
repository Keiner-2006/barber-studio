export interface IAppointmentRepository {
  findAll(tenantId: string, filters?: AppointmentFilters): Promise<Appointment[]>;
  findById(tenantId: string, id: string): Promise<Appointment | null>;
  create(tenantId: string, data: CreateAppointmentData): Promise<Appointment>;
  update(tenantId: string, id: string, data: UpdateAppointmentData): Promise<Appointment | null>;
}

export interface AppointmentFilters {
  branchId?: string;
  customerId?: string;
  staffId?: string;
  status?: 'pending' | 'confirmed' | 'checked_in' | 'in_service' | 'completed' | 'cancelled' | 'no_show';
  startsAtFrom?: Date;
  startsAtTo?: Date;
}

export interface CreateAppointmentData {
  branchId: string;
  customerId: string;
  serviceId: string;
  staffId?: string;
  startsAt: Date;
  endsAt?: Date;
  durationMinutes?: number;
  status?: 'pending' | 'confirmed' | 'checked_in' | 'in_service' | 'completed' | 'cancelled' | 'no_show';
  source?: 'online' | 'phone' | 'walk_in' | 'admin';
  notes?: string;
  idempotencyKey?: string;
}

export interface UpdateAppointmentData {
  branchId?: string;
  customerId?: string;
  serviceId?: string;
  staffId?: string;
  startsAt?: Date;
  endsAt?: Date;
  status?: 'pending' | 'confirmed' | 'checked_in' | 'in_service' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  cancellationReason?: string;
}

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly branchId: string,
    public readonly customerId: string,
    public readonly serviceId: string,
    public readonly staffId: string | null,
    public readonly startsAt: Date,
    public readonly endsAt: Date,
    public readonly serviceNameSnapshot: string,
    public readonly serviceDurationSnapshot: number,
    public readonly status: 'pending' | 'confirmed' | 'checked_in' | 'in_service' | 'completed' | 'cancelled' | 'no_show',
    public readonly source: string | null,
    public readonly priceSnapshot: number,
    public readonly currencySnapshot: string,
    public readonly notes: string | null,
    public readonly cancellationReason: string | null,
    public readonly idempotencyKey: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      branchId: this.branchId,
      customerId: this.customerId,
      serviceId: this.serviceId,
      staffId: this.staffId,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      serviceNameSnapshot: this.serviceNameSnapshot,
      serviceDurationSnapshot: this.serviceDurationSnapshot,
      status: this.status,
      source: this.source,
      priceSnapshot: this.priceSnapshot,
      currencySnapshot: this.currencySnapshot,
      notes: this.notes,
      cancellationReason: this.cancellationReason,
      idempotencyKey: this.idempotencyKey,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface IAppointmentPaymentRepository {
  findByAppointmentId(tenantId: string, appointmentId: string): Promise<AppointmentPayment[]>;
  create(tenantId: string, data: CreateAppointmentPaymentData): Promise<AppointmentPayment>;
}

export interface CreateAppointmentPaymentData {
  appointmentId: string;
  amount: number;
  currency: string;
  method: 'cash' | 'card_manual' | 'transfer_manual' | 'other';
  status?: 'pending' | 'recorded' | 'refunded' | 'voided';
  reference?: string;
  recordedBy?: string;
}

export class AppointmentPayment {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly appointmentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly method: 'cash' | 'card_manual' | 'transfer_manual' | 'other',
    public readonly status: 'pending' | 'recorded' | 'refunded' | 'voided',
    public readonly reference: string | null,
    public readonly recordedBy: string | null,
    public readonly createdAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      appointmentId: this.appointmentId,
      amount: this.amount,
      currency: this.currency,
      method: this.method,
      status: this.status,
      reference: this.reference,
      recordedBy: this.recordedBy,
      createdAt: this.createdAt,
    };
  }
}
