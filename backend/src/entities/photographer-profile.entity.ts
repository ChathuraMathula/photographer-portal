import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('photographer_profiles')
export class PhotographerProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  bookingSlug!: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'simple-array', default: '' })
  specializations!: string[];

  @Column({ nullable: true })
  portfolioUrl?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true })
  baseLocation?: string;

  @Column({ default: true })
  isAvailableForBooking!: boolean;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
