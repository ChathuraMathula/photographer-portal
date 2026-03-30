import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}

  onModuleInit() {
    console.log('MonogDB Connection: ', this.connection.readyState);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
