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
    const sTime = dto.startTime || '00:00';
    const eTime = dto.endTime || '23:59';
    const isNewFullDay = sTime === '00:00' && eTime === '23:59';

    // Find any existing locks for this photographer on the given date
    const existingLocks = await this.lockedDateRepository.find({
      where: {
        photographerId,
        date: dto.date,
      },
    });

    if (existingLocks.length > 0) {
      // 1. If any existing lock is already a full day lock, return it (no duplicates)
      const existingFullDay = existingLocks.find(
        (ld) => ld.startTime === '00:00' && ld.endTime === '23:59',
      );
      if (existingFullDay) {
        return existingFullDay;
      }

      // 2. If the new lock is a full day lock, remove all existing partial locks for this date
      if (isNewFullDay) {
        await this.lockedDateRepository.remove(existingLocks);
      } else {
        // 3. If new lock overlaps with an existing partial lock, return the existing lock
        const overlapping = existingLocks.find(
          (ld) => ld.startTime < eTime && ld.endTime > sTime,
        );
        if (overlapping) {
          return overlapping;
        }
      }
    }

    const lockedDate = this.lockedDateRepository.create({
      photographerId,
      date: dto.date,
      startTime: sTime,
      endTime: eTime,
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
