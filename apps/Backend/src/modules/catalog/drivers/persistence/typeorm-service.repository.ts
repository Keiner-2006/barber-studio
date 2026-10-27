import { Injectable, Inject } from '@nestjs/common';
import { Repository, type DeepPartial } from 'typeorm';
import { IServiceRepository, Service, CreateServiceData } from '../../domain/catalog.domain';
import { ServiceEntity } from './service.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmServiceRepository implements IServiceRepository {
  private get repository(): Repository<ServiceEntity> {
    return this.dataSource.getRepository(ServiceEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string, categoryId?: string): Promise<Service[]> {
    const where: any = { tenantId };
    if (categoryId) {
      where.categoryId = categoryId;
    }
    const entities = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<Service | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateServiceData): Promise<Service> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    } as DeepPartial<ServiceEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: ServiceEntity): Service {
    return new Service(
      entity.id,
      entity.tenantId,
      entity.categoryId,
      entity.name,
      entity.description,
      entity.durationMinutes,
      entity.priceBase,
      entity.currency,
      entity.paymentPolicy,
      entity.depositType,
      entity.depositValue,
      entity.cancellationMinutes,
      entity.active,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}