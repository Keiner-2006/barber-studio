import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlatformTenantEntity } from './platform-tenant.entity';

@Entity({ name: 'tenant_media_assets', schema: 'public' })
@Unique(['tenantId', 'purpose'])
@Index(['tenantId'])
export class TenantMediaAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'provider', type: 'text', default: 'cloudinary' })
  provider: string;

  @Column({ name: 'provider_asset_id', type: 'text' })
  providerAssetId: string;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @Column({ name: 'secure_url', type: 'text', nullable: true })
  secureUrl: string | null;

  @Column({ name: 'resource_type', type: 'text', nullable: true })
  resourceType: string | null;

  @Column({ name: 'width', type: 'integer', nullable: true })
  width: number | null;

  @Column({ name: 'height', type: 'integer', nullable: true })
  height: number | null;

  @Column({ name: 'alt_text', type: 'text', nullable: true })
  altText: string | null;

  @Column({ name: 'purpose', type: 'text' })
  purpose: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PlatformTenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: PlatformTenantEntity;
}