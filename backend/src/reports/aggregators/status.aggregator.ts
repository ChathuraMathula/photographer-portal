import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';

export async function aggregateStatusDistribution(
  reservationRepository: Repository<Reservation>,
  startDate: Date,
  endDate: Date,
  photographerId?: string,
): Promise<{ name: string; value: number }[]> {
  const qb = reservationRepository
    .createQueryBuilder('res')
    .select('res.status', 'name')
    .addSelect('COUNT(res.id)', 'value')
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate });

  if (photographerId) {
    qb.andWhere('res.photographerId = :photographerId', { photographerId });
  }

  const raw = await qb.groupBy('res.status').getRawMany();

  const statuses = ['PENDING', 'PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'];
  const statusMap = new Map<string, number>(statuses.map((s) => [s, 0]));

  raw.forEach((item) => {
    if (statusMap.has(item.name)) {
      statusMap.set(item.name, parseInt(item.value, 10) || 0);
    }
  });

  return Array.from(statusMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}
