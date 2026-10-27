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

export enum PlatformUserStatusEnum {
  INVITED = 'invited',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

@Entity({ name: 'platform_users', schema: 'public' })
@Unique(['email'])
export class PlatformUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName: string | null;

  @Column({ name: 'phone', type: 'text', nullable: true })
  phone: string | null;

  @Column({ name: 'whatsapp', type: 'text', nullable: true })
  whatsapp: string | null;

  @Column({ name: 'document_type', type: 'text', nullable: true })
  documentType: string | null;

  @Column({ name: 'document_number', type: 'text', nullable: true })
  documentNumber: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ name: 'city', type: 'text', nullable: true })
  city: string | null;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ name: 'status', type: 'enum', enum: PlatformUserStatusEnum, default: PlatformUserStatusEnum.ACTIVE })
  status: PlatformUserStatusEnum;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => PlatformMembershipEntity, (membership) => membership.user)
  memberships: PlatformMembershipEntity[];
}