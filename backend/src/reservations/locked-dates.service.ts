import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LockedDate } from '../entities/locked-date.entity';
import { CreateLockedDateDto } from './dto/create-locked-date.dto';

@Injectable()
export class LockedDatesService {
  constructor(
    @InjectRepository(LockedDate)
    private readonly lockedDateRepository: Repository<LockedDate>,
  ) {}

  async getLockedDates(
    photographerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<LockedDate[]> {
    const query = this.lockedDateRepository
      .createQueryBuilder('ld')
      .where('ld.photographerId = :photographerId', { photographerId });

    if (startDate) {
      query.andWhere('ld.date >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('ld.date <= :endDate', { endDate });
    }

    query.orderBy('ld.date', 'ASC').addOrderBy('ld.startTime', 'ASC');

    return query.getMany();
  }

  async createLockedDate(
    photographerId: string,
    dto: CreateLockedDateDto,
  ): Promise<LockedDate> {
    const lockedDate = this.lockedDateRepository.create({
      photographerId,
      date: dto.date,
      startTime: dto.startTime || '00:00',
      endTime: dto.endTime || '23:59',
      reason: dto.reason,
    });
    return this.lockedDateRepository.save(lockedDate);
  }

  async deleteLockedDate(
    photographerId: string,
    id: string,
  ): Promise<{ message: string }> {
    const locked = await this.lockedDateRepository.findOneBy({ id });
    if (!locked) {
      throw new NotFoundException('Locked date record not found');
    }
    if (locked.photographerId !== photographerId) {
      throw new ForbiddenException(
        'You do not have permission to delete this locked date',
      );
    }
    await this.lockedDateRepository.remove(locked);
    return { message: 'Date time slot unlocked successfully' };
  }
}
