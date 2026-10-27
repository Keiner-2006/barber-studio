import { Injectable, Inject } from '@nestjs/common';
import { Repository, type DeepPartial } from 'typeorm';
import { IProductRepository, Product, CreateProductData } from '../../domain/inventory.domain';
import { ProductEntity } from './product.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  private get repository(): Repository<ProductEntity> {
    return this.dataSource.getRepository(ProductEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<Product[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySku(tenantId: string, sku: string): Promise<Product | null> {
    const entity = await this.repository.findOne({
      where: { sku, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateProductData): Promise<Product> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    } as DeepPartial<ProductEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.tenantId,
      entity.name,
      entity.sku,
      entity.description,
      entity.category,
      entity.unit,
      entity.unitCost,
      entity.suggestedPrice,
      entity.minQuantity,
      entity.active,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
