import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { PlatformTenantEntity } from './platform-tenant.entity';

export enum ProvisioningJobStatusEnum {
  QUEUED = 'queued',
  RUNNING = 'running',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  COMPENSATED = 'compensated',
}

@Entity({ name: 'tenant_provisioning_jobs', schema: 'public' })
@Unique(['idempotencyKey'])
@Index(['tenantId'])
export class TenantProvisioningJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'idempotency_key', type: 'text' })
  idempotencyKey: string;

  @Column({ name: 'status', type: 'enum', enum: ProvisioningJobStatusEnum, default: ProvisioningJobStatusEnum.QUEUED })
  status: ProvisioningJobStatusEnum;

  @Column({ name: 'step', type: 'text', nullable: true })
  step: string | null;

  @Column({ name: 'error_code', type: 'text', nullable: true })
  errorCode: string | null;

  @Column({ name: 'error_detail', type: 'text', nullable: true })
  errorDetail: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @ManyToOne(() => PlatformTenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: PlatformTenantEntity;
}