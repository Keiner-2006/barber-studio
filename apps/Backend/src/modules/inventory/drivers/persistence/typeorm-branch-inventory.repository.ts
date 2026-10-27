import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IBranchInventoryRepository, BranchInventory, CreateBranchInventoryData } from '../../domain/inventory.domain';
import { BranchInventoryEntity } from './branch-inventory.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmBranchInventoryRepository implements IBranchInventoryRepository {
  private get repository(): Repository<BranchInventoryEntity> {
    return this.dataSource.getRepository(BranchInventoryEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findByBranchAndProduct(branchId: string, productId: string): Promise<BranchInventory | null> {
    const entity = await this.repository.findOne({
      where: { branchId, productId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByBranch(branchId: string): Promise<BranchInventory[]> {
    const entities = await this.repository.find({
      where: { branchId },
      relations: ['product'],
    });
    return entities.map(this.toDomain);
  }

  async create(data: CreateBranchInventoryData): Promise<BranchInventory> {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async updateQuantity(branchId: string, productId: string, quantity: number): Promise<BranchInventory | null> {
    await this.repository.update({ branchId, productId }, { quantity });
    return this.findByBranchAndProduct(branchId, productId);
  }

  private toDomain(entity: BranchInventoryEntity): BranchInventory {
    return new BranchInventory(
      entity.id,
      entity.tenantId,
      entity.branchId,
      entity.productId,
      entity.quantity,
      entity.reserved,
      entity.averageCost,
      entity.updatedAt,
    );
  }
}
