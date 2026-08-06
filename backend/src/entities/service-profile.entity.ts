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

@Entity('service_profiles')
export class ServiceProfile {
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
  coverImageUrl?: string;

  @Column({ nullable: true })
  baseLocation?: string;

  @Column({ nullable: true })
  locationMapLink?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ default: true })
  showMapPreviewOnBookingPage!: boolean;

  @Column({ default: true })
  isAvailableForBooking!: boolean;

  @Column({ type: 'simple-array', default: '' })
  allowedEventTypes!: string[];

  @Column({ default: true })
  allowCustomEventTypes!: boolean;

  @Column({ type: 'text', nullable: true })
  offlineMessage?: string;

  @Column({ type: 'float', default: 4.8 })
  rating!: number;

  @Column({ type: 'integer', default: 12 })
  ratingCount!: number;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column({ default: 'fixed' })
  universalDepositType!: string;

  @Column({ type: 'integer', default: 500000 })
  universalDepositValue!: number;

  @Column({ default: 'INVOICE' })
  invoiceTitle!: string;

  @Column({ default: '#2563eb' })
  invoiceColor!: string;

  @Column({
    type: 'text',
    default: 'Thank you for booking with us! We appreciate your trust.',
  })
  invoiceNotes!: string;

  @Column({ nullable: true })
  invoiceLogoText?: string;

  @Column({ nullable: true })
  invoicePhone?: string;

  @Column({ type: 'float', default: 0 })
  invoiceTaxRate!: number;

  @Column({ type: 'text', nullable: true })
  invoiceInstructions?: string;

  @Column({ default: true })
  showManualBookingInTopbar!: boolean;

  @Column({ default: true })
  showAcceptBookingsInTopbar!: boolean;

  @Column({ type: 'integer', default: 24 })
  proposalExpirationHours!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// Export alias for backward compatibility
export { ServiceProfile as PhotographerProfile };
