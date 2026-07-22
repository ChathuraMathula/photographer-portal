import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../../entities/package.entity';

@Injectable()
export class PackageQueryService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
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
}
