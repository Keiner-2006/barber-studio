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
import { BranchEntity } from '../../../branches/drivers/persistence/branch.entity';
import { UserEntity } from '../../../auth/drivers/persistence/user.entity';

@Entity({ name: 'cash_registers', schema: 'public' })
@Index(['tenantId'])
@Index(['branchId'])
export class CashRegisterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({ name: 'initial_balance', type: 'numeric', precision: 12, scale: 2, default: 0 })
  initialBalance: number;

  @Column({ name: 'opened_by', type: 'uuid', nullable: true })
  openedBy: string | null;

  @Column({ name: 'closed_by', type: 'uuid', nullable: true })
  closedBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branch_id' })
  branch: BranchEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'opened_by' })
  openedByUser: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'closed_by' })
  closedByUser: UserEntity;
}
