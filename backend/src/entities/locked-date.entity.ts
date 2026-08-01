import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('locked_dates')
export class LockedDate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  photographerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographerId' })
  photographer: User;

  @Column({ type: 'varchar', length: 10 })
  date: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 5, default: '00:00' })
  startTime: string; // HH:mm

  @Column({ type: 'varchar', length: 5, default: '23:59' })
  endTime: string; // HH:mm

  @Column({ type: 'varchar', nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
