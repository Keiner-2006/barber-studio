import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceEntity } from '../../../catalog/drivers/persistence/service.entity';

export enum PromotionTypeEnum {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  BUY_X_GET_Y = 'buy_x_get_y',
  FREE_SERVICE = 'free_service',
}

export enum PromotionStatusEnum {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'promotions', schema: 'public' })
@Unique(['tenantId', 'code'])
@Index(['tenantId'])
@Index(['status'])
@Index(['startsAt', 'endsAt'])
export class PromotionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'type', type: 'enum', enum: PromotionTypeEnum })
  type: PromotionTypeEnum;

  @Column({ name: 'value', type: 'numeric', precision: 12, scale: 2 })
  value: number;

  @Column({ name: 'buy_quantity', type: 'integer', nullable: true })
  buyQuantity: number | null;

  @Column({ name: 'get_quantity', type: 'integer', nullable: true })
  getQuantity: number | null;

  @Column({ name: 'service_id', type: 'uuid', nullable: true })
  serviceId: string | null;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'usage_limit', type: 'integer', nullable: true })
  usageLimit: number | null;

  @Column({ name: 'usage_count', type: 'integer', default: 0 })
  usageCount: number;

  @Column({ name: 'status', type: 'enum', enum: PromotionStatusEnum, default: PromotionStatusEnum.DRAFT })
  status: PromotionStatusEnum;

  @Column({ name: 'is_combinable', type: 'boolean', default: false })
  isCombinable: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => ServiceEntity)
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;
}