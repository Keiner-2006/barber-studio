export interface IProductRepository {
  findAll(tenantId: string): Promise<Product[]>;
  findById(tenantId: string, id: string): Promise<Product | null>;
  findBySku(tenantId: string, sku: string): Promise<Product | null>;
  create(tenantId: string, data: CreateProductData): Promise<Product>;
}

export interface CreateProductData {
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unit?: string;
  unitCost?: number;
  suggestedPrice?: number;
  minQuantity?: number;
  active?: boolean;
}

export class Product {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly name: string,
    public readonly sku: string,
    public readonly description: string | null,
    public readonly category: string | null,
    public readonly unit: string,
    public readonly unitCost: number,
    public readonly suggestedPrice: number | null,
    public readonly minQuantity: number,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      sku: this.sku,
      description: this.description,
      category: this.category,
      unit: this.unit,
      unitCost: this.unitCost,
      suggestedPrice: this.suggestedPrice,
      minQuantity: this.minQuantity,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface IBranchInventoryRepository {
  findByBranchAndProduct(branchId: string, productId: string): Promise<BranchInventory | null>;
  findByBranch(branchId: string): Promise<BranchInventory[]>;
  create(data: CreateBranchInventoryData): Promise<BranchInventory>;
  updateQuantity(branchId: string, productId: string, quantity: number): Promise<BranchInventory | null>;
}

export interface CreateBranchInventoryData {
  tenantId: string;
  branchId: string;
  productId: string;
  quantity?: number;
  reserved?: number;
}

export class BranchInventory {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly branchId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly reserved: number,
    public readonly averageCost: number,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      branchId: this.branchId,
      productId: this.productId,
      quantity: this.quantity,
      reserved: this.reserved,
      averageCost: this.averageCost,
      updatedAt: this.updatedAt,
    };
  }
}
