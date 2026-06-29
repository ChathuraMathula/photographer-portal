import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { PhotographerProfile } from './photographer-profile.entity';
import { Package } from './package.entity';
import { Reservation } from './reservation.entity';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PHOTOGRAPHER = 'PHOTOGRAPHER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  phone?: string;

  @OneToOne(() => PhotographerProfile, (profile) => profile.user)
  profile?: PhotographerProfile;

  @OneToMany(() => Package, (pkg) => pkg.photographer)
  packages?: Package[];

  @OneToMany(() => Reservation, (reservation) => reservation.photographer)
  reservations?: Reservation[];

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
