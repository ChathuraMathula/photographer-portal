import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageQueryService } from './services/package-query.service';
import { PackageMutationsService } from './services/package-mutations.service';

@Injectable()
export class PackagesService {
  constructor(
    private readonly queryService: PackageQueryService,
    private readonly mutationsService: PackageMutationsService,
  ) {}

  async findAll(photographerId: string) {
    return this.queryService.findAll(photographerId);
  }

  async findOne(id: string, photographerId: string) {
    return this.queryService.findOne(id, photographerId);
  }

  async create(dto: CreatePackageDto, photographerId: string) {
    return this.mutationsService.create(dto, photographerId);
  }

  async update(id: string, dto: UpdatePackageDto, photographerId: string) {
    return this.mutationsService.update(id, dto, photographerId);
  }

  async remove(id: string, photographerId: string) {
    return this.mutationsService.remove(id, photographerId);
  }
}
