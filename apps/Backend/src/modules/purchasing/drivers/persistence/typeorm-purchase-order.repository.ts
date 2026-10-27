import { Injectable, Inject } from '@nestjs/common';
import { Repository, type DeepPartial } from 'typeorm';
import { IPurchaseOrderRepository, PurchaseOrder, CreatePurchaseOrderData } from '../../domain/purchasing.domain';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmPurchaseOrderRepository implements IPurchaseOrderRepository {
  private get repository(): Repository<PurchaseOrderEntity> {
    return this.dataSource.getRepository(PurchaseOrderEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<PurchaseOrder[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<PurchaseOrder | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    } as DeepPartial<PurchaseOrderEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: PurchaseOrderEntity): PurchaseOrder {
    return new PurchaseOrder(
      entity.id,
      entity.tenantId,
      entity.branchId,
      entity.supplierId,
      entity.status,
      entity.expectedDate,
      entity.notes,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
