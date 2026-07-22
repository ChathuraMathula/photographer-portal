import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';

export async function aggregateLeaderboard(
  reservationRepository: Repository<Reservation>,
  startDate: Date,
  endDate: Date,
  page: number,
  limit: number,
  search?: string,
) {
  const skip = (page - 1) * limit;

  const qb = reservationRepository
    .createQueryBuilder('res')
    .leftJoinAndSelect('res.photographer', 'photo')
    .select('photo.id', 'id')
    .addSelect('photo.firstName', 'firstName')
    .addSelect('photo.lastName', 'lastName')
    .addSelect('photo.email', 'email')
    .addSelect('COUNT(res.id)', 'bookingsCount')
    .addSelect('SUM(res."totalAmountInCents")', 'totalAmountInCents')
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere("res.status NOT IN ('CANCELLED', 'REJECTED')")
    .andWhere('photo.id IS NOT NULL');

  if (search) {
    qb.andWhere(
      '(LOWER(photo.firstName) LIKE :search OR LOWER(photo.lastName) LIKE :search OR LOWER(photo.email) LIKE :search)',
      { search: `%${search.toLowerCase()}%` },
    );
  }

  qb.groupBy('photo.id')
    .addGroupBy('photo.firstName')
    .addGroupBy('photo.lastName')
    .addGroupBy('photo.email')
    .orderBy('"totalAmountInCents"', 'DESC')
    .offset(skip)
    .limit(limit);

  const rawResults = await qb.getRawMany();

  const countQb = reservationRepository
    .createQueryBuilder('res')
    .leftJoin('res.photographer', 'photo')
    .select('COUNT(DISTINCT photo.id)', 'total')
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere("res.status NOT IN ('CANCELLED', 'REJECTED')")
    .andWhere('photo.id IS NOT NULL');

  if (search) {
    countQb.andWhere(
      '(LOWER(photo.firstName) LIKE :search OR LOWER(photo.lastName) LIKE :search OR LOWER(photo.email) LIKE :search)',
      { search: `%${search.toLowerCase()}%` },
    );
  }

  const countResult = await countQb.getRawOne();
  const total = parseInt(countResult.total, 10) || 0;

  const leaderboard = rawResults.map((row) => ({
    id: row.id,
    name: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email,
    bookingsCount: parseInt(row.bookingsCount, 10) || 0,
    revenueLkr: (parseInt(row.totalAmountInCents, 10) || 0) / 100,
  }));

  return {
    data: leaderboard,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
