import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

export enum ConsentTypeEnum {
  MARKETING = 'marketing',
  DATA_PROCESSING = 'data_processing',
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

export enum ConsentStatusEnum {
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
}

@Entity({ name: 'customer_consents', schema: 'public' })
@Unique(['tenantId', 'customerId', 'type'])
@Index(['tenantId'])
@Index(['customerId'])
export class CustomerConsentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'type', type: 'enum', enum: ConsentTypeEnum })
  type: ConsentTypeEnum;

  @Column({ name: 'status', type: 'enum', enum: ConsentStatusEnum })
  status: ConsentStatusEnum;

  @Column({ name: 'version', type: 'text' })
  version: string;

  @Column({ name: 'ip_address', type: 'text', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}