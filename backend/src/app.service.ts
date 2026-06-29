import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log(
        '✅ PostgreSQL connected successfully to Docker container via TypeORM',
      );
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
