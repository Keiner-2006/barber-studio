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
import { ServiceCategoryEntity } from './service-category.entity';

export enum PaymentPolicyEnum {
  NONE = 'none',
  DEPOSIT = 'deposit',
  FULL = 'full',
}

export enum DepositTypeEnum {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

@Entity({ name: 'services', schema: 'public' })
@Index(['tenantId'])
@Index(['tenantId', 'active'])
@Index(['categoryId'])
export class ServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({ name: 'price_base', type: 'numeric', precision: 12, scale: 2 })
  priceBase: number;

  @Column({ name: 'currency', type: 'text', default: 'MXN' })
  currency: string;

  @Column({ name: 'payment_policy', type: 'text', default: 'none' })
  paymentPolicy: string;

  @Column({ name: 'deposit_type', type: 'text', nullable: true })
  depositType: string | null;

  @Column({ name: 'deposit_value', type: 'numeric', precision: 12, scale: 2, nullable: true })
  depositValue: number | null;

  @Column({ name: 'cancellation_minutes', type: 'integer', nullable: true })
  cancellationMinutes: number | null;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ServiceCategoryEntity, (category) => category.services)
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategoryEntity;
}
