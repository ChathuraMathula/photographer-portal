import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Package } from '../entities/package.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation } from '../entities/reservation.entity';
import { Message } from '../entities/message.entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'admin',
  password: 'securepassword123',
  database: 'portal',
  entities: [User, PhotographerProfile, Package, Customer, Reservation, Message],
  migrations: ['src/migrations/*.ts', 'dist/migrations/*.js'],
  synchronize: false,
});
