import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { PlatformMembershipEntity } from './platform-membership.entity';

export enum TenantStatusEnum {
  PROVISIONING = 'provisioning',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETING = 'deleting',
  DELETED = 'deleted',
}

export enum BusinessTypeEnum {
  BARBERIA = 'barberia',
  PELUQUERIA = 'peluqueria',
  GROOMING = 'grooming',
  OTRO = 'otro',
}

@Entity({ name: 'platform_tenants', schema: 'public' })
@Unique(['slug'])
export class PlatformTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legal_name', type: 'text' })
  legalName: string;

  @Column({ name: 'trade_name', type: 'text' })
  tradeName: string;

  @Column({ type: 'text' })
  slug: string;

  @Column({ name: 'business_type', type: 'enum', enum: BusinessTypeEnum })
  businessType: BusinessTypeEnum;

  @Column({ name: 'status', type: 'enum', enum: TenantStatusEnum, default: TenantStatusEnum.PROVISIONING })
  status: TenantStatusEnum;

  @Column({ name: 'country_code', type: 'text', default: 'CO' })
  countryCode: string;

  @Column({ name: 'timezone', type: 'text', default: 'America/Bogota' })
  timezone: string;

  @Column({ name: 'currency_code', type: 'text', default: 'COP' })
  currencyCode: string;

  @Column({ name: 'locale', type: 'text', default: 'es' })
  locale: string;

  @Column({ name: 'phone', type: 'text', nullable: true })
  phone: string | null;

  @Column({ name: 'database_host', type: 'text', nullable: true })
  databaseHost: string | null;

  @Column({ name: 'database_name', type: 'text', nullable: true })
  databaseName: string | null;

  @Column({ name: 'database_secret_ref', type: 'text', nullable: true })
  databaseSecretRef: string | null;

  @Column({ name: 'schema_version', type: 'text', nullable: true })
  schemaVersion: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => PlatformMembershipEntity, (membership) => membership.tenant)
  memberships: PlatformMembershipEntity[];
}