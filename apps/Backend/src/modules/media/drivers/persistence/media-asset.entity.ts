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
import { UserEntity } from '../../../auth/drivers/persistence/user.entity';

export enum MediaAssetTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  SIGNATURE = 'signature',
}

@Entity({ name: 'media_assets', schema: 'public' })
@Index(['tenantId'])
@Index(['type'])
@Index(['createdBy'])
export class MediaAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'type', type: 'enum', enum: MediaAssetTypeEnum })
  type: MediaAssetTypeEnum;

  @Column({ name: 'file_name', type: 'text' })
  fileName: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'mime_type', type: 'text' })
  mimeType: string;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @Column({ name: 'provider', type: 'text', default: 'cloudinary' })
  provider: string;

  @Column({ name: 'provider_id', type: 'text', nullable: true })
  providerId: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdByUser: UserEntity;
}