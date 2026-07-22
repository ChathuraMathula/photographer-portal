import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PackageQueryService } from './services/package-query.service';
import { PackageMutationsService } from './services/package-mutations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PackagesController],
  providers: [PackagesService, PackageQueryService, PackageMutationsService],
  exports: [PackagesService, PackageQueryService, PackageMutationsService],
})
export class PackagesModule {}
