import { Injectable, Inject } from '@nestjs/common';
import { Repository, type QueryDeepPartialEntity } from 'typeorm';
import { ICashRegisterRepository, CashRegister, CreateCashRegisterData, UpdateCashRegisterData } from '../../domain/cash.domain';
import { CashRegisterEntity } from './cash-register.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmCashRegisterRepository implements ICashRegisterRepository {
  private get repository(): Repository<CashRegisterEntity> {
    return this.dataSource.getRepository(CashRegisterEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<CashRegister[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<CashRegister | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateCashRegisterData): Promise<CashRegister> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(tenantId: string, id: string, data: UpdateCashRegisterData): Promise<CashRegister | null> {
    await this.repository.update({ id, tenantId }, data as QueryDeepPartialEntity<CashRegisterEntity>);
    return this.findById(tenantId, id);
  }

  private toDomain(entity: CashRegisterEntity): CashRegister {
    return new CashRegister(
      entity.id,
      entity.tenantId,
      entity.branchId,
      entity.name,
      entity.status,
      entity.initialBalance,
      entity.openedBy,
      entity.closedBy,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
