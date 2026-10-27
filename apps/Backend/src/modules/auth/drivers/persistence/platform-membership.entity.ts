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
import { PlatformUserEntity } from './platform-user.entity';

export enum PlatformMembershipRoleEnum {
  OWNER = 'owner',
  PLATFORM_ADMIN = 'platform_admin',
  ADMIN = 'admin',
  RECEPTION = 'reception',
  BARBER = 'barber',
  INVENTORY_MANAGER = 'inventory_manager',
  ACCOUNTANT = 'accountant',
  PLATFORM_SUPPORT = 'platform_support',
}

@Entity({ name: 'platform_memberships', schema: 'public' })
@Unique(['tenantId', 'userId'])
@Index(['userId'])
@Index(['tenantId'])
export class PlatformMembershipEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'role', type: 'enum', enum: PlatformMembershipRoleEnum })
  role: PlatformMembershipRoleEnum;

  @Column({ name: 'status', type: 'text', default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => PlatformTenantEntity, (tenant) => tenant.memberships)
  @JoinColumn({ name: 'tenant_id' })
  tenant: PlatformTenantEntity;

  @ManyToOne(() => PlatformUserEntity, (user) => user.memberships)
  @JoinColumn({ name: 'user_id' })
  user: PlatformUserEntity;
}