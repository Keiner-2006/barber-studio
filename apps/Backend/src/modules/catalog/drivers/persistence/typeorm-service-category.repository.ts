import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IServiceCategoryRepository, ServiceCategory, CreateServiceCategoryData } from '../../domain/catalog.domain';
import { ServiceCategoryEntity } from './service-category.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmServiceCategoryRepository implements IServiceCategoryRepository {
  private get repository(): Repository<ServiceCategoryEntity> {
    return this.dataSource.getRepository(ServiceCategoryEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<ServiceCategory[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<ServiceCategory | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateServiceCategoryData): Promise<ServiceCategory> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: ServiceCategoryEntity): ServiceCategory {
    return new ServiceCategory(
      entity.id,
      entity.tenantId,
      entity.name,
      entity.description,
      entity.displayOrder,
      entity.active,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}