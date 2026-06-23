import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.packages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'photographerId' })
  photographer!: User;

  @Column()
  photographerId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer' })
  priceInCents!: number;

  @Column({ type: 'integer' })
  durationHours!: number;

  @Column({ type: 'simple-array', default: '' })
  includes!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 'universal' })
  depositType!: string;

  @Column({ type: 'integer', default: 0 })
  depositValue!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
