import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppointmentEntity } from './appointment.entity';

export enum PaymentMethodEnum {
  CASH = 'cash',
  CARD_MANUAL = 'card_manual',
  TRANSFER_MANUAL = 'transfer_manual',
  OTHER = 'other',
}

export enum PaymentStatusEnum {
  PENDING = 'pending',
  RECORDED = 'recorded',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
}

@Entity({ name: 'appointment_payments', schema: 'public' })
@Index(['appointmentId'])
@Index(['tenantId'])
export class AppointmentPaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId: string;

  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'text' })
  currency: string;

  @Column({ name: 'method', type: 'enum', enum: PaymentMethodEnum })
  method: PaymentMethodEnum;

  @Column({ name: 'status', type: 'enum', enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING })
  status: PaymentStatusEnum;

  @Column({ name: 'reference', type: 'text', nullable: true })
  reference: string | null;

  @Column({ name: 'recorded_by', type: 'uuid', nullable: true })
  recordedBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => AppointmentEntity, (appointment) => appointment.payments)
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentEntity;
}
