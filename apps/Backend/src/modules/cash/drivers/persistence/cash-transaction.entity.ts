import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../../auth/drivers/persistence/user.entity';

export enum CashTransactionTypeEnum {
  SALE = 'sale',
  APPOINTMENT = 'appointment',
  EXPENSE = 'expense',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export enum CashPaymentMethodEnum {
  CASH = 'cash',
  CARD_MANUAL = 'card_manual',
  TRANSFER_MANUAL = 'transfer_manual',
  OTHER = 'other',
}

@Entity({ name: 'cash_transactions', schema: 'public' })
@Index(['tenantId'])
@Index(['sessionId'])
@Index(['tenantId', 'createdAt'])
export class CashTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ name: 'type', type: 'enum', enum: CashTransactionTypeEnum })
  type: CashTransactionTypeEnum;

  @Column({ name: 'method', type: 'enum', enum: CashPaymentMethodEnum })
  method: CashPaymentMethodEnum;

  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'text', default: 'MXN' })
  currency: string;

  @Column({ name: 'reference', type: 'text', nullable: true })
  reference: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @Column({ name: 'reconciled', type: 'boolean', default: false })
  reconciled: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'actor_id' })
  actor: UserEntity;
}
