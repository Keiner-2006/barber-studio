import { Injectable, Inject } from '@nestjs/common';
import { Repository, Between, type DeepPartial, type QueryDeepPartialEntity } from 'typeorm';
import { IAppointmentRepository, Appointment, CreateAppointmentData, UpdateAppointmentData, AppointmentFilters } from '../../domain/appointment.domain';
import { AppointmentEntity } from './appointment.entity';
import { ServiceEntity } from '../../../catalog/drivers/persistence/service.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmAppointmentRepository implements IAppointmentRepository {
  private get repository(): Repository<AppointmentEntity> {
    return this.dataSource.getRepository(AppointmentEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string, filters?: AppointmentFilters): Promise<Appointment[]> {
    const where: any = { tenantId };
    
    if (filters?.branchId) where.branchId = filters.branchId;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.status) where.status = filters.status;
    
    if (filters?.startsAtFrom || filters?.startsAtTo) {
      where.startsAt = Between(
        filters.startsAtFrom || new Date('1900-01-01'),
        filters.startsAtTo || new Date('2100-01-01'),
      );
    }

    const entities = await this.repository.find({
      where,
      order: { startsAt: 'ASC' },
      relations: ['branch', 'customer', 'service', 'staff'],
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<Appointment | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
      relations: ['branch', 'customer', 'service', 'staff'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateAppointmentData): Promise<Appointment> {
    const service = await this.dataSource.getRepository(ServiceEntity).findOne({
      where: { id: data.serviceId, tenantId },
    });
    if (!service) throw new Error('Servicio no encontrado');
    const durationMinutes = data.durationMinutes ?? service.durationMinutes;
    const startsAt = data.startsAt;
    const entity = this.repository.create({
      ...data,
      tenantId,
      endsAt: data.endsAt ?? new Date(startsAt.getTime() + durationMinutes * 60_000),
      serviceNameSnapshot: service.name,
      durationMinutes,
      price: service.priceBase,
      currencySnapshot: service.currency,
    } as DeepPartial<AppointmentEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(tenantId: string, id: string, data: UpdateAppointmentData): Promise<Appointment | null> {
    await this.repository.update({ id, tenantId }, data as QueryDeepPartialEntity<AppointmentEntity>);
    return this.findById(tenantId, id);
  }

  private toDomain(entity: AppointmentEntity): Appointment {
    return new Appointment(
      entity.id,
      entity.tenantId,
      entity.branchId,
      entity.customerId,
      entity.serviceId,
      entity.staffId,
      entity.startsAt,
      entity.endsAt,
      entity.serviceNameSnapshot,
      entity.durationMinutes,
      entity.status,
      entity.source,
      entity.price,
      entity.currencySnapshot,
      entity.notes,
      entity.cancellationReason,
      entity.idempotencyKey,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}