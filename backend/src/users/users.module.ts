import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { EmailModule } from '../email/email.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, ReservationsModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
