import { DataSource } from 'typeorm';
import { join } from 'path';
import fs from 'fs';
import { User } from '../entities/user.entity';
import { PhotographerProfile } from '../entities/photographer-profile.entity';
import { Package } from '../entities/package.entity';
import { Customer } from '../entities/customer.entity';
import { Reservation } from '../entities/reservation.entity';
import { Message } from '../entities/message.entity';
import { Payment } from '../entities/payment.entity';

// Load local .env variables
const envPath = join(process.cwd(), '.env');
if (
  fs.existsSync(envPath) &&
  typeof (process as any).loadEnvFile === 'function'
) {
  (process as any).loadEnvFile(envPath);
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
  username: process.env.DB_USERNAME ?? 'admin',
  password: process.env.DB_PASSWORD ?? 'securepassword123',
  database: process.env.DB_DATABASE ?? 'portal',
  entities: [
    User,
    PhotographerProfile,
    Package,
    Customer,
    Reservation,
    Message,
    Payment,
  ],
  migrations: ['src/migrations/*.ts', 'dist/migrations/*.js'],
  synchronize: false,
});
