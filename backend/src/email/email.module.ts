import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { EmailService } from './email.service';
import { EmailWorkerService } from './email-worker.service';
import { EmailController } from './email.controller';
import { RemindersService } from './reminders.service';
import { Reservation } from '../entities/reservation.entity';
import { User } from '../entities/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User]), RabbitMQModule],
  controllers: [EmailController],
  providers: [EmailService, EmailWorkerService, RemindersService],
  exports: [EmailService],
})
export class EmailModule {}
