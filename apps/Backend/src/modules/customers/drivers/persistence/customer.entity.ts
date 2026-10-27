import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'customers', schema: 'public' })
@Index(['tenantId'])
@Index(['tenantId', 'phone'])
@Index(['tenantId', 'email'])
export class CustomerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'first_name', type: 'text' })
  firstName: string;

  @Column({ name: 'last_name', type: 'text' })
  lastName: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName: string;

  @Column({ name: 'email', type: 'text', nullable: true })
  email: string | null;

  @Column({ name: 'phone', type: 'text', nullable: true })
  phone: string | null;

  @Column({ name: 'document', type: 'text', nullable: true })
  document: string | null;

  @Column({ name: 'birth_date', type: 'timestamptz', nullable: true })
  birthDate: Date | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'preferences', type: 'jsonb', nullable: true })
  preferences: Record<string, any> | null;

  @Column({ name: 'consents', type: 'jsonb', nullable: true })
  consents: Record<string, any> | null;

  @Column({ name: 'marketing_consent', type: 'boolean', default: false })
  marketingConsent: boolean;

  @Column({ name: 'total_visits', type: 'text', default: '0' })
  totalVisits: string;

  @Column({ name: 'total_spent', type: 'text', default: '0' })
  totalSpent: string;

  @Column({ name: 'currency', type: 'text', default: 'COP' })
  currency: string;

  @Column({ name: 'last_visit_at', type: 'timestamptz', nullable: true })
  lastVisitAt: Date | null;

  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
