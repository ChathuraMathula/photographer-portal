import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Package } from '../entities/package.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation } from '../entities/reservation.entity';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PhotographerProfile,
      Package,
      Customer,
      Reservation,
      Message,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
