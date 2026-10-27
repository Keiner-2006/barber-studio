export interface IBranchRepository {
  findAll(tenantId: string): Promise<Branch[]>;
  findById(tenantId: string, id: string): Promise<Branch | null>;
  findByCode(tenantId: string, code: string): Promise<Branch | null>;
  create(tenantId: string, data: CreateBranchData): Promise<Branch>;
  update(tenantId: string, id: string, data: UpdateBranchData): Promise<Branch | null>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export interface CreateBranchData {
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  timezone?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateBranchData {
  code?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  timezone?: string;
  status?: 'active' | 'inactive';
}

export class Branch {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly code: string,
    public readonly name: string,
    public readonly address: string | null,
    public readonly city: string | null,
    public readonly state: string | null,
    public readonly country: string | null,
    public readonly postalCode: string | null,
    public readonly phone: string | null,
    public readonly timezone: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      code: this.code,
      name: this.name,
      address: this.address,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
      phone: this.phone,
      timezone: this.timezone,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
