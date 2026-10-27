import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlatformUserEntity } from './platform-user.entity';
import { PlatformTenantEntity } from './platform-tenant.entity';

@Entity({ name: 'platform_audit_events', schema: 'public' })
@Index(['actorId'])
@Index(['tenantId'])
@Index(['createdAt'])
export class PlatformAuditEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ name: 'action', type: 'text' })
  action: string;

  @Column({ name: 'resource', type: 'text', nullable: true })
  resource: string | null;

  @Column({ name: 'resource_id', type: 'text', nullable: true })
  resourceId: string | null;

  @Column({ name: 'result', type: 'text', nullable: true })
  result: string | null;

  @Column({ name: 'metadata', type: 'text', nullable: true })
  metadata: string | null;

  @Column({ name: 'ip_address', type: 'text', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PlatformUserEntity)
  @JoinColumn({ name: 'actor_id' })
  actor: PlatformUserEntity;

  @ManyToOne(() => PlatformTenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: PlatformTenantEntity;
}