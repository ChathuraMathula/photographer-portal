import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';

export async function aggregateRawBookings(
  reservationRepository: Repository<Reservation>,
  startDate: Date,
  endDate: Date,
  photographerId?: string,
) {
  const qb = reservationRepository
    .createQueryBuilder('res')
    .leftJoin('res.customer', 'cust')
    .select('res.id', 'id')
    .addSelect('res.eventType', 'eventType')
    .addSelect('res.locationMapLink', 'locationMapLink')
    .addSelect('res.district', 'district')
    .addSelect('res.city', 'city')
    .addSelect('res.location', 'location')
    .addSelect('res.status', 'status')
    .addSelect("CONCAT(cust.firstName, ' ', cust.lastName)", 'clientName')
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .andWhere('res.status NOT IN (:...excludedStatuses)', {
      excludedStatuses: [
        ReservationStatus.REJECTED,
        ReservationStatus.CANCELLED,
      ],
    });

  if (photographerId) {
    qb.andWhere('res.photographerId = :photographerId', { photographerId });
  }

  return qb.getRawMany();
}
