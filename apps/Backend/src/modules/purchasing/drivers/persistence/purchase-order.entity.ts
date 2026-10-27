import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BranchEntity } from '../../../branches/drivers/persistence/branch.entity';
import { SupplierEntity } from './supplier.entity';
import { UserEntity } from '../../../auth/drivers/persistence/user.entity';
import { PurchaseOrderItemEntity } from './purchase-order-item.entity';

export enum PurchaseOrderStatusEnum {
  DRAFT = 'draft',
  SENT = 'sent',
  PARTIAL = 'partial',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'purchase_orders', schema: 'public' })
@Index(['tenantId'])
@Index(['branchId'])
@Index(['supplierId'])
@Index(['status'])
export class PurchaseOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({ name: 'status', type: 'enum', enum: PurchaseOrderStatusEnum, default: PurchaseOrderStatusEnum.DRAFT })
  status: PurchaseOrderStatusEnum;

  @Column({ name: 'expected_date', type: 'timestamptz', nullable: true })
  expectedDate: Date | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @ManyToOne(() => SupplierEntity, (supplier) => supplier.purchaseOrders)
  @JoinColumn({ name: 'supplier_id' })
  supplier: SupplierEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdByUser: UserEntity;

  @OneToMany(() => PurchaseOrderItemEntity, (item) => item.purchaseOrder)
  items: PurchaseOrderItemEntity[];
}
