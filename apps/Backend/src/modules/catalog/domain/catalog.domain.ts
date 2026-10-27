export interface IServiceCategoryRepository {
  findAll(tenantId: string): Promise<ServiceCategory[]>;
  findById(tenantId: string, id: string): Promise<ServiceCategory | null>;
  create(tenantId: string, data: CreateServiceCategoryData): Promise<ServiceCategory>;
}

export interface CreateServiceCategoryData {
  name: string;
  description?: string;
  displayOrder?: number;
  active?: boolean;
}

export class ServiceCategory {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly displayOrder: number,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      description: this.description,
      displayOrder: this.displayOrder,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface IServiceRepository {
  findAll(tenantId: string, categoryId?: string): Promise<Service[]>;
  findById(tenantId: string, id: string): Promise<Service | null>;
  create(tenantId: string, data: CreateServiceData): Promise<Service>;
}

export interface CreateServiceData {
  categoryId: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  priceBase?: number;
  currency?: string;
  paymentPolicy?: string;
  depositType?: string;
  depositValue?: number;
  cancellationMinutes?: number;
  active?: boolean;
}

export class Service {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly categoryId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly durationMinutes: number,
    public readonly priceBase: number,
    public readonly currency: string,
    public readonly paymentPolicy: string,
    public readonly depositType: string | null,
    public readonly depositValue: number | null,
    public readonly cancellationMinutes: number | null,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      categoryId: this.categoryId,
      name: this.name,
      description: this.description,
      durationMinutes: this.durationMinutes,
      priceBase: this.priceBase,
      currency: this.currency,
      paymentPolicy: this.paymentPolicy,
      depositType: this.depositType,
      depositValue: this.depositValue,
      cancellationMinutes: this.cancellationMinutes,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
