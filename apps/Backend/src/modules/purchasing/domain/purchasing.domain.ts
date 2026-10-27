export interface ISupplierRepository {
  findAll(tenantId: string): Promise<Supplier[]>;
  findById(tenantId: string, id: string): Promise<Supplier | null>;
  create(tenantId: string, data: CreateSupplierData): Promise<Supplier>;
  update(tenantId: string, id: string, data: Partial<CreateSupplierData>): Promise<Supplier | null>;
  deactivate(tenantId: string, id: string): Promise<Supplier | null>;
}

export interface CreateSupplierData {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  active?: boolean;
}

export class Supplier {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly contactName: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly address: string | null,
    public readonly notes: string | null,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      contactName: this.contactName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      notes: this.notes,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface IPurchaseOrderRepository {
  findAll(tenantId: string): Promise<PurchaseOrder[]>;
  findById(tenantId: string, id: string): Promise<PurchaseOrder | null>;
  create(tenantId: string, data: CreatePurchaseOrderData): Promise<PurchaseOrder>;
}

export interface CreatePurchaseOrderData {
  branchId: string;
  supplierId: string;
  status?: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
  expectedDate?: Date;
  notes?: string;
  createdBy: string;
}

export class PurchaseOrder {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly branchId: string,
    public readonly supplierId: string,
    public readonly status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled',
    public readonly expectedDate: Date | null,
    public readonly notes: string | null,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      branchId: this.branchId,
      supplierId: this.supplierId,
      status: this.status,
      expectedDate: this.expectedDate,
      notes: this.notes,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
