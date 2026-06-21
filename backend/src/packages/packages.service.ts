import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  async findAll(photographerId: string) {
    return this.packageRepository.find({
      where: { photographerId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, photographerId: string) {
    const pkg = await this.packageRepository.findOneBy({ id });
    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.photographerId !== photographerId) {
      throw new ForbiddenException('Access denied');
    }
    return pkg;
  }

  async create(dto: CreatePackageDto, photographerId: string) {
    const pkg = this.packageRepository.create({
      ...dto,
      photographerId,
      isActive: true,
    });
    return this.packageRepository.save(pkg);
  }

  async update(id: string, dto: UpdatePackageDto, photographerId: string) {
    const pkg = await this.findOne(id, photographerId);
    Object.assign(pkg, dto);
    return this.packageRepository.save(pkg);
  }

  async remove(id: string, photographerId: string) {
    const pkg = await this.findOne(id, photographerId);
    // Mark as inactive (soft delete) to preserve historical bookings
    pkg.isActive = false;
    await this.packageRepository.save(pkg);
    return { success: true };
  }
}
