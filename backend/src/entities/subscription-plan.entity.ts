import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PlanBillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum PlanTargetType {
  PHOTOGRAPHER = 'PHOTOGRAPHER',
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  priceInCents!: number;

  @Column({
    type: 'enum',
    enum: PlanBillingInterval,
    default: PlanBillingInterval.MONTHLY,
  })
  billingInterval!: PlanBillingInterval;

  @Column({
    type: 'enum',
    enum: PlanTargetType,
    default: PlanTargetType.PHOTOGRAPHER,
  })
  targetType!: PlanTargetType;

  @Column({ type: 'simple-array', nullable: true })
  features?: string[];

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
