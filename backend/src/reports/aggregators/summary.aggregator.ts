import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';

export async function aggregateSummary(
  reservationRepository: Repository<Reservation>,
  paymentRepository: Repository<Payment>,
  startDate: Date,
  endDate: Date,
  photographerId?: string,
) {
  const summaryQb = reservationRepository
    .createQueryBuilder('res')
    .select('COUNT(res.id)', 'totalBookings')
    .addSelect(
      "SUM(CASE WHEN res.status NOT IN ('CANCELLED', 'REJECTED') THEN res.\"totalAmountInCents\" ELSE 0 END)",
      'potentialRevenueCents',
    )
    .addSelect(
      "SUM(CASE WHEN res.status IN ('CONFIRMED', 'COMPLETED') THEN 1 ELSE 0 END)",
      'successfulBookings',
    )
    .where('res.date BETWEEN :startDate AND :endDate', { startDate, endDate });

  if (photographerId) {
    summaryQb.andWhere('res.photographerId = :photographerId', { photographerId });
  }

  const rawSummary = await summaryQb.getRawOne();

  const paymentQb = paymentRepository
    .createQueryBuilder('pay')
    .leftJoin('pay.reservation', 'res')
    .select('SUM(pay."amountInCents")', 'paidRevenueCents')
    .where('pay.status = :status', { status: PaymentStatus.SUCCESS })
    .andWhere('pay.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });

  if (photographerId) {
    paymentQb.andWhere('res.photographerId = :photographerId', { photographerId });
  }

  const rawPayment = await paymentQb.getRawOne();

  const totalBookings = parseInt(rawSummary.totalBookings, 10) || 0;
  const potentialRevenueCents = parseInt(rawSummary.potentialRevenueCents, 10) || 0;
  const successfulBookings = parseInt(rawSummary.successfulBookings, 10) || 0;
  const paidRevenueCents = parseInt(rawPayment.paidRevenueCents, 10) || 0;

  const conversionRate =
    totalBookings > 0 ? Math.round((successfulBookings / totalBookings) * 100) : 0;

  const potentialRevenueLkr = potentialRevenueCents / 100;
  const paidRevenueLkr = paidRevenueCents / 100;
  const pendingRevenueLkr = Math.max(0, potentialRevenueLkr - paidRevenueLkr);

  return {
    totalBookings,
    potentialRevenueLkr,
    paidRevenueLkr,
    pendingRevenueLkr,
    conversionRate,
  };
}
