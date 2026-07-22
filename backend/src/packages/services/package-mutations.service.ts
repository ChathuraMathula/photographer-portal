import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../../entities/package.entity';
import { CreatePackageDto } from '../dto/create-package.dto';
import { UpdatePackageDto } from '../dto/update-package.dto';
import { PackageQueryService } from './package-query.service';

@Injectable()
export class PackageMutationsService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    private readonly queryService: PackageQueryService,
  ) {}

  async create(dto: CreatePackageDto, photographerId: string) {
    const pkg = this.packageRepository.create({
      ...dto,
      photographerId,
      isActive: true,
    });
    return this.packageRepository.save(pkg);
  }

  async update(id: string, dto: UpdatePackageDto, photographerId: string) {
    const pkg = await this.queryService.findOne(id, photographerId);
    Object.assign(pkg, dto);
    return this.packageRepository.save(pkg);
  }

  async remove(id: string, photographerId: string) {
    const pkg = await this.queryService.findOne(id, photographerId);
    // Mark as inactive (soft delete) to preserve historical bookings
    pkg.isActive = false;
    await this.packageRepository.save(pkg);
    return { success: true };
  }
}
