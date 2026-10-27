import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { ProductEntity } from '../../../inventory/drivers/persistence/product.entity';

@Entity({ name: 'purchase_order_items', schema: 'public' })
@Index(['tenantId'])
@Index(['orderId'])
@Index(['productId'])
export class PurchaseOrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'quantity_ordered', type: 'integer' })
  quantityOrdered: number;

  @Column({ name: 'quantity_received', type: 'integer', default: 0 })
  quantityReceived: number;

  @Column({ name: 'unit_cost', type: 'numeric', precision: 12, scale: 2 })
  unitCost: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => PurchaseOrderEntity, (po) => po.items)
  @JoinColumn({ name: 'order_id' })
  purchaseOrder: PurchaseOrderEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
