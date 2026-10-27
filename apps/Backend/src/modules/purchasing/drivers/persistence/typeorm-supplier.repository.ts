import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ISupplierRepository, Supplier, CreateSupplierData } from '../../domain/purchasing.domain';
import { SupplierEntity } from './supplier.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmSupplierRepository implements ISupplierRepository {
  private get repository(): Repository<SupplierEntity> {
    return this.dataSource.getRepository(SupplierEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<Supplier[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<Supplier | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateSupplierData): Promise<Supplier> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(tenantId: string, id: string, data: Partial<CreateSupplierData>): Promise<Supplier | null> {
    await this.repository.update({ id, tenantId }, data);
    return this.findById(tenantId, id);
  }

  async deactivate(tenantId: string, id: string): Promise<Supplier | null> {
    await this.repository.update({ id, tenantId }, { active: false });
    return this.findById(tenantId, id);
  }

  private toDomain(entity: SupplierEntity): Supplier {
    return new Supplier(
      entity.id,
      entity.tenantId,
      entity.name,
      entity.contactName,
      entity.email,
      entity.phone,
      entity.address,
      entity.notes,
      entity.active,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
