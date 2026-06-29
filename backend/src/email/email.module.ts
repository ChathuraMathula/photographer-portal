import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { RemindersService } from './reminders.service';
import { Reservation } from '../entities/reservation.entity';
import { User } from '../entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User])],
  providers: [EmailService, RemindersService],
  exports: [EmailService],
})
export class EmailModule {}
