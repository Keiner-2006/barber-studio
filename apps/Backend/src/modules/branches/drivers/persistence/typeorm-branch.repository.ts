import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IBranchRepository, Branch, CreateBranchData, UpdateBranchData } from '../../domain/branch.domain';
import { BranchEntity, BranchStatusEnum } from './branch.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmBranchRepository implements IBranchRepository {
  private get repository(): Repository<BranchEntity> {
    return this.dataSource.getRepository(BranchEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<Branch[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<Branch | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(tenantId: string, code: string): Promise<Branch | null> {
    const entity = await this.repository.findOne({
      where: { code, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateBranchData): Promise<Branch> {
    const statusEnum = data.status ? BranchStatusEnum[data.status.toUpperCase() as keyof typeof BranchStatusEnum] : BranchStatusEnum.ACTIVE;
    const entity = this.repository.create({
      ...data,
      tenantId,
      status: statusEnum,
    } as any);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved as unknown as BranchEntity);
  }

  async update(tenantId: string, id: string, data: UpdateBranchData): Promise<Branch | null> {
    const updateData: any = { ...data };
    if (data.status) {
      updateData.status = BranchStatusEnum[data.status.toUpperCase() as keyof typeof BranchStatusEnum];
    }
    await this.repository.update({ id, tenantId }, updateData);
    return this.findById(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const result = await this.repository.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }

  private toDomain(entity: BranchEntity): Branch {
    return new Branch(
      entity.id,
      entity.tenantId,
      entity.code,
      entity.name,
      entity.address,
      entity.city,
      entity.state,
      entity.country,
      entity.postalCode,
      entity.phone,
      entity.timezone,
      entity.status,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}