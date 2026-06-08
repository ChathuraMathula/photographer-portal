import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { Customer, CustomerSchema } from '../schemas/customer.schema';
import { Reservation, ReservationSchema } from '../schemas/reservation.schema';
import {
  PhotographerProfile,
  PhotographerProfileSchema,
} from '../schemas/photographer-profile.schema';
import { Package, PackageSchema } from '../schemas/package.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: PhotographerProfile.name, schema: PhotographerProfileSchema },
      { name: Package.name, schema: PackageSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
