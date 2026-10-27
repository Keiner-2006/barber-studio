export interface ICustomerRepository {
  findAll(tenantId: string): Promise<Customer[]>;
  findById(tenantId: string, id: string): Promise<Customer | null>;
  findByEmail(tenantId: string, email: string): Promise<Customer | null>;
  findByPhone(tenantId: string, phone: string): Promise<Customer | null>;
  findByDocument(tenantId: string, document: string): Promise<Customer | null>;
  create(tenantId: string, data: CreateCustomerData): Promise<Customer>;
  update(tenantId: string, id: string, data: UpdateCustomerData): Promise<Customer | null>;
}

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: Date;
  notes?: string;
  preferences?: Record<string, any>;
  consents?: Record<string, any>;
  marketingConsent?: boolean;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: Date;
  notes?: string;
  preferences?: Record<string, any>;
  consents?: Record<string, any>;
  marketingConsent?: boolean;
  archivedAt?: Date;
}

export class Customer {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly fullName: string,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly document: string | null,
    public readonly birthDate: Date | null,
    public readonly notes: string | null,
    public readonly preferences: Record<string, any> | null,
    public readonly consents: Record<string, any> | null,
    public readonly marketingConsent: boolean,
    public readonly totalVisits: string,
    public readonly totalSpent: string,
    public readonly currency: string,
    public readonly lastVisitAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      document: this.document,
      birthDate: this.birthDate,
      notes: this.notes,
      preferences: this.preferences,
      consents: this.consents,
      marketingConsent: this.marketingConsent,
      totalVisits: this.totalVisits,
      totalSpent: this.totalSpent,
      currency: this.currency,
      lastVisitAt: this.lastVisitAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
