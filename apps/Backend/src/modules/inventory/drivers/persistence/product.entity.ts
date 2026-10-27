import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';

@Entity({ name: 'products', schema: 'public' })
@Unique(['tenantId', 'sku'])
@Index(['tenantId'])
@Index(['tenantId', 'active'])
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'sku', type: 'text' })
  sku: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'category', type: 'text', nullable: true })
  category: string | null;

  @Column({ name: 'unit', type: 'text', default: 'pieza' })
  unit: string;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2 })
  unitCost: number;

  @Column({ name: 'suggested_price', type: 'numeric', precision: 12, scale: 2, nullable: true })
  suggestedPrice: number | null;

  @Column({ name: 'min_quantity', type: 'integer', default: 0 })
  minQuantity: number;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
