import { Injectable, Inject } from '@nestjs/common';
import { Repository, type DeepPartial, type QueryDeepPartialEntity } from 'typeorm';
import { ICustomerRepository, Customer, CreateCustomerData, UpdateCustomerData } from '../../domain/customer.domain';
import { CustomerEntity } from './customer.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmCustomerRepository implements ICustomerRepository {
  private get repository(): Repository<CustomerEntity> {
    return this.dataSource.getRepository(CustomerEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<Customer[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(tenantId: string, email: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { email, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByPhone(tenantId: string, phone: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { phone, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByDocument(tenantId: string, document: string): Promise<Customer | null> {
    const entity = await this.repository.findOne({
      where: { document, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateCustomerData): Promise<Customer> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    } as DeepPartial<CustomerEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(tenantId: string, id: string, data: UpdateCustomerData): Promise<Customer | null> {
    await this.repository.update({ id, tenantId }, data as QueryDeepPartialEntity<CustomerEntity>);
    return this.findById(tenantId, id);
  }

  private toDomain(entity: CustomerEntity): Customer {
    return new Customer(
      entity.id,
      entity.tenantId,
      entity.firstName,
      entity.lastName,
      entity.fullName,
      entity.email,
      entity.phone,
      entity.document,
      entity.birthDate,
      entity.notes,
      entity.preferences,
      entity.consents,
      entity.marketingConsent,
      entity.totalVisits,
      entity.totalSpent,
      entity.currency,
      entity.lastVisitAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}