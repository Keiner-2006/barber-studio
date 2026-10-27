import { Injectable, Inject } from '@nestjs/common';
import { Repository, type DeepPartial } from 'typeorm';
import { IAppointmentPaymentRepository, AppointmentPayment, CreateAppointmentPaymentData } from '../../domain/appointment.domain';
import { AppointmentPaymentEntity } from './appointment-payment.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmAppointmentPaymentRepository implements IAppointmentPaymentRepository {
  private get repository(): Repository<AppointmentPaymentEntity> {
    return this.dataSource.getRepository(AppointmentPaymentEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findByAppointmentId(tenantId: string, appointmentId: string): Promise<AppointmentPayment[]> {
    const entities = await this.repository.find({
      where: { appointmentId, tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async create(tenantId: string, data: CreateAppointmentPaymentData): Promise<AppointmentPayment> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    } as DeepPartial<AppointmentPaymentEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: AppointmentPaymentEntity): AppointmentPayment {
    return new AppointmentPayment(
      entity.id,
      entity.tenantId,
      entity.appointmentId,
      entity.amount,
      entity.currency,
      entity.method,
      entity.status,
      entity.reference,
      entity.recordedBy,
      entity.createdAt,
    );
  }
}