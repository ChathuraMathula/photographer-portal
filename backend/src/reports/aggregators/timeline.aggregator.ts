import { Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { initTimelineMap } from './timeline-helpers/timeline-map-init';
import { populateTimelineMap } from './timeline-helpers/timeline-map-populator';

export async function aggregateTimeline(
  resRepo: Repository<Reservation>,
  payRepo: Repository<Payment>,
  startDate: Date,
  endDate: Date,
  photographerId?: string,
): Promise<
  {
    label: string;
    bookings: number;
    revenueLkr: number
  }[]
> {
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
  const type = diffDays <= 8 ? 'daily' : diffDays <= 45 ? 'monthly' : 'yearly';

  const timelineMap: Record<string, { bookings: number; revenueLkr: number }> = {};
  initTimelineMap(timelineMap, type, endDate, diffDays);

  const bookingsQb = resRepo
    .createQueryBuilder('res')
    .select('res.date', 'date')
    .addSelect('COUNT(res.id)', 'count')
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate });

  if (photographerId) {
    bookingsQb.andWhere('res.photographerId = :photographerId', { photographerId });
  }
  const rawBookings = await bookingsQb.groupBy('res.date').getRawMany();

  const paymentsQb = payRepo
    .createQueryBuilder('pay')
    .leftJoin('pay.reservation', 'res')
    .select("DATE(pay.createdAt AT TIME ZONE 'Asia/Colombo')", 'date')
    .addSelect('SUM(pay."amountInCents")', 'amountInCents')
    .where('pay.status = :status', { status: PaymentStatus.SUCCESS })
    .andWhere('pay.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });

  if (photographerId) {
    paymentsQb.andWhere('res.photographerId = :photographerId', { photographerId });
  }
  const rawPayments = await paymentsQb
    .groupBy("DATE(pay.createdAt AT TIME ZONE 'Asia/Colombo')")
    .getRawMany();

  populateTimelineMap(timelineMap, type, rawBookings, rawPayments);

  return Object.entries(timelineMap).map(([label, data]) => ({
    label,
    bookings: data.bookings,
    revenueLkr: data.revenueLkr,
  }));
}
