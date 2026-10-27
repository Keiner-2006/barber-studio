import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BranchEntity } from '../../../branches/drivers/persistence/branch.entity';
import { CustomerEntity } from '../../../customers/drivers/persistence/customer.entity';
import { ServiceEntity } from '../../../catalog/drivers/persistence/service.entity';
import { StaffProfileEntity } from '../../../branches/drivers/persistence/staff-profile.entity';
import { UserEntity } from '../../../auth/drivers/persistence/user.entity';
import { AppointmentPaymentEntity } from './appointment-payment.entity';

export enum AppointmentStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_SERVICE = 'in_service',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum AppointmentSourceEnum {
  ONLINE = 'online',
  PHONE = 'phone',
  WALK_IN = 'walk_in',
  ADMIN = 'admin',
}

@Entity({ name: 'appointments', schema: 'public' })
@Index(['tenantId'])
@Index(['branchId'])
@Index(['customerId'])
@Index(['staffId'])
@Index(['startsAt'])
@Index(['status'])
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;

  @Column({ name: 'service_duration_snapshot', type: 'integer' })
  durationMinutes: number;

  @Column({ name: 'status', type: 'enum', enum: AppointmentStatusEnum, default: AppointmentStatusEnum.PENDING })
  status: AppointmentStatusEnum;

  @Column({ name: 'source', type: 'text', nullable: true })
  source: string | null;

  @Column({ name: 'service_name_snapshot', type: 'text' })
  serviceNameSnapshot: string;

  @Column({ name: 'price_snapshot', type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ name: 'currency_snapshot', type: 'text' })
  currencySnapshot: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'idempotency_key', type: 'text', nullable: true })
  idempotencyKey: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => ServiceEntity)
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @ManyToOne(() => StaffProfileEntity)
  @JoinColumn({ name: 'staff_id' })
  staff: StaffProfileEntity;

  @OneToMany(() => AppointmentPaymentEntity, (payment) => payment.appointment)
  payments: AppointmentPaymentEntity[];
}
