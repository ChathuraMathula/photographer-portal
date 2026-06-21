import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Reservation, (reservation) => reservation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationId' })
  reservation!: Reservation;

  @Column()
  reservationId!: string;

  @Column({
    type: 'varchar',
  })
  sender!: 'PHOTOGRAPHER' | 'CUSTOMER';

  @Column()
  senderName!: string;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
