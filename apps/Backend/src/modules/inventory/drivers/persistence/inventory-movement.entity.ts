import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { BranchEntity } from '../../../branches/drivers/persistence/branch.entity';
import { UserEntity } from '../../../auth/drivers/persistence/user.entity';

export enum InventoryMovementTypeEnum {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  CONSUMPTION = 'consumption',
  RETURN = 'return',
}

@Entity({ name: 'inventory_movements', schema: 'public' })
@Index(['tenantId'])
@Index(['productId'])
@Index(['branchId'])
@Index(['tenantId', 'createdAt'])
export class InventoryMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({ name: 'type', type: 'enum', enum: InventoryMovementTypeEnum })
  type: InventoryMovementTypeEnum;

  @Column({ name: 'quantity', type: 'numeric', precision: 12, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2, nullable: true })
  unitCost: number | null;

  @Column({ name: 'reference', type: 'text', nullable: true })
  reference: string | null;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'actor_id' })
  actor: UserEntity;
}
