import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';

export async function aggregateEventTypes(
  reservationRepository: Repository<Reservation>,
  startDate: Date,
  endDate: Date,
  photographerId?: string,
): Promise<{ name: string; count: number }[]> {
  const qb = reservationRepository
    .createQueryBuilder('res')
    .select('res.eventType', 'name')
    .addSelect('COUNT(res.id)', 'count')
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate });

  if (photographerId) {
    qb.andWhere('res.photographerId = :photographerId', { photographerId });
  }

  const raw = await qb.groupBy('res.eventType').getRawMany();

  return raw.map((item) => ({
    name: item.name || 'Other',
    count: parseInt(item.count, 10) || 0,
  }));
}
