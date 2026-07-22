import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';

export async function aggregatePackages(
  reservationRepository: Repository<Reservation>,
  startDate: Date,
  endDate: Date,
  photographerId?: string,
): Promise<{ name: string; count: number; revenueLkr: number }[]> {
  const qb = reservationRepository
    .createQueryBuilder('res')
    .select("COALESCE(res.\"selectedPackages\"->0->>'name', 'Custom/Quotation')", 'name')
    .addSelect('COUNT(res.id)', 'count')
    .addSelect('SUM(res."totalAmountInCents")', 'revenueCents')
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere("res.status NOT IN ('CANCELLED', 'REJECTED')");

  if (photographerId) {
    qb.andWhere('res.photographerId = :photographerId', { photographerId });
  }

  const raw = await qb
    .groupBy("COALESCE(res.\"selectedPackages\"->0->>'name', 'Custom/Quotation')")
    .getRawMany();

  return raw
    .map((item) => ({
      name: item.name,
      count: parseInt(item.count, 10) || 0,
      revenueLkr: (parseInt(item.revenueCents, 10) || 0) / 100,
    }))
    .sort((a, b) => b.revenueLkr - a.revenueLkr);
}
