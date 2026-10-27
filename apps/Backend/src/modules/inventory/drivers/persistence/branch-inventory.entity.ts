import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Unique,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BranchEntity } from '../../../branches/drivers/persistence/branch.entity';
import { ProductEntity } from './product.entity';

@Entity({ name: 'branch_inventory', schema: 'public' })
@Unique(['branchId', 'productId'])
@Index(['branchId'])
@Index(['productId'])
export class BranchInventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'quantity', type: 'numeric', precision: 12, scale: 3, default: 0 })
  quantity: number;

  @Column({ name: 'reserved', type: 'numeric', precision: 12, scale: 3, default: 0 })
  reserved: number;

  @Column({ name: 'average_cost', type: 'numeric', precision: 12, scale: 2, default: 0 })
  averageCost: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
