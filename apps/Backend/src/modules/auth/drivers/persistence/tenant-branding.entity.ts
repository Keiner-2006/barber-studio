import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { PlatformTenantEntity } from './platform-tenant.entity';

@Entity({ name: 'tenant_branding', schema: 'public' })
export class TenantBrandingEntity {
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ name: 'cover_image_url', type: 'text', nullable: true })
  coverImageUrl: string | null;

  @Column({ name: 'gallery_urls', type: 'jsonb', nullable: true })
  galleryUrls: string[] | null;

  @Column({ name: 'primary_color', type: 'text', nullable: true })
  primaryColor: string | null;

  @Column({ name: 'secondary_color', type: 'text', nullable: true })
  secondaryColor: string | null;

  @Column({ name: 'accent_color', type: 'text', nullable: true })
  accentColor: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'social_links', type: 'jsonb', nullable: true })
  socialLinks: Record<string, string> | null;

  @Column({ name: 'public_booking_enabled', type: 'boolean', default: false })
  publicBookingEnabled: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToOne(() => PlatformTenantEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant: PlatformTenantEntity;
}