import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  reservationId!: string;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationId' })
  reservation!: Reservation;

  @Column({ type: 'integer' })
  amountInCents!: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  status!: PaymentStatus;

  @Column()
  transactionId!: string;

  @Column({ nullable: true })
  cardBrand?: string;

  @Column({ nullable: true })
  cardLast4?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
