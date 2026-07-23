import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { Message } from './message.entity';
import { Payment } from './payment.entity';

export enum ReservationStatus {
  PENDING = 'PENDING',
  PROPOSED = 'PROPOSED',
  REJECTED = 'REJECTED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Customer, (customer) => customer.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column()
  customerId!: string;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographerId' })
  photographer!: User;

  @Column()
  photographerId!: string;

  @Column({ type: 'date' })
  date!: Date;

  @Column()
  startTime!: string;

  @Column()
  endTime!: string;

  @Column()
  eventType!: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  locationMapLink?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ type: 'text', nullable: true })
  customerNotes?: string;

  @Column({ type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ type: 'integer', nullable: true })
  totalAmountInCents?: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status!: ReservationStatus;

  @Column({ unique: true })
  reservationToken!: string;

  @Column({ nullable: true })
  invoiceUrl?: string;

  @Column({ type: 'timestamp', nullable: true })
  invoiceGeneratedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paymentDeadline?: Date;

  @Column({ type: 'integer', nullable: true })
  advancePaymentPriceInCents?: number;

  @Column({ type: 'text', nullable: true })
  quotationNotes?: string;

  @Column({ type: 'boolean', default: false })
  usePackageWiseDeposit!: boolean;

  @Column({ nullable: true })
  clientSelectedPackageId?: string;

  @Column({ type: 'jsonb', nullable: true })
  selectedPackages?: any; // Snapshotted packages

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @OneToMany(() => Message, (message) => message.reservation)
  messages?: Message[];

  @OneToMany(() => Payment, (payment) => payment.reservation)
  payments?: Payment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'boolean', default: false })
  isRead!: boolean;
}
