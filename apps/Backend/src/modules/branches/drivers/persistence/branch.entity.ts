import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
  OneToMany,
} from 'typeorm';
import { StaffProfileEntity } from './staff-profile.entity';

export enum BranchStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity({ name: 'branches', schema: 'public' })
@Unique(['code'])
@Index(['tenantId'])
export class BranchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'city', type: 'text', nullable: true })
  city: string | null;

  @Column({ name: 'state', type: 'text', nullable: true })
  state: string | null;

  @Column({ name: 'country', type: 'text', nullable: true })
  country: string | null;

  @Column({ name: 'postal_code', type: 'text', nullable: true })
  postalCode: string | null;

  @Column({ name: 'phone', type: 'text', nullable: true })
  phone: string | null;

  @Column({ name: 'timezone', type: 'text' })
  timezone: string;

  @Column({ name: 'status', type: 'enum', enum: BranchStatusEnum, default: BranchStatusEnum.ACTIVE })
  status: BranchStatusEnum;

  @Column({ name: 'operating_hours', type: 'jsonb', nullable: true })
  operatingHours: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => StaffProfileEntity, (staff) => staff.branch)
  staff: StaffProfileEntity[];
}
