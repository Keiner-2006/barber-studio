import { Injectable, Inject } from '@nestjs/common';
import { Repository, type DeepPartial } from 'typeorm';
import { ICashTransactionRepository, CashTransaction, CreateCashTransactionData } from '../../domain/cash.domain';
import { CashTransactionEntity } from './cash-transaction.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmCashTransactionRepository implements ICashTransactionRepository {
  private get repository(): Repository<CashTransactionEntity> {
    return this.dataSource.getRepository(CashTransactionEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findBySession(tenantId: string, sessionId: string): Promise<CashTransaction[]> {
    const entities = await this.repository.find({
      where: { sessionId, tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async create(tenantId: string, data: CreateCashTransactionData): Promise<CashTransaction> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    } as DeepPartial<CashTransactionEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: CashTransactionEntity): CashTransaction {
    return new CashTransaction(
      entity.id,
      entity.tenantId,
      entity.sessionId,
      entity.type,
      entity.method,
      entity.amount,
      entity.currency,
      entity.reference,
      entity.notes,
      entity.actorId,
      entity.reconciled,
      entity.createdAt,
    );
  }
}
