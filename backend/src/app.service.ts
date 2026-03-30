import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}

  onModuleInit() {
    if (this.connection.readyState === ConnectionStates.connected) {
      console.log('✅ MongoDB connected successfully to Docker container');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
