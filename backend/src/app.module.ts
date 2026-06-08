import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PhotographersModule } from './photographers/photographers.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://admin:securepassword123@localhost:27017/portal?authSource=admin',
    ),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    ReservationsModule,
    PhotographersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
