import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Reservation, ReservationStatus } from '../../entities/reservation.entity';
import { User } from '../../entities/user.entity';
import { EmailService } from '../email.service';

@Injectable()
export class RemindersService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private timer: NodeJS.Timeout | null = null;
  private processedReminders = new Set<string>();

  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  onApplicationBootstrap() {
    // Run the reminder check every 60 seconds
    this.timer = setInterval(() => this.checkReminders(), 60 * 1000);
    // Also trigger once initially after startup
    setTimeout(() => this.checkReminders(), 5000);
  }

  onApplicationShutdown() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async checkReminders() {
    try {
      const now = new Date();

      // 1. Find PROPOSED reservations approaching payment deadline (e.g. within 12 hours)
      const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      const proposedReservations = await this.reservationRepository.find({
        where: {
          status: ReservationStatus.PROPOSED,
          paymentDeadline: LessThan(twelveHoursFromNow),
        },
        relations: { customer: true, photographer: true },
      });

      for (const res of proposedReservations) {
        const key = `payment_reminder_${res.id}`;
        if (this.processedReminders.has(key)) continue;

        // Verify photographer has reminders enabled
        if (res.photographer && !res.photographer.reminderEmailsEnabled) {
          continue;
        }

        const origin = process.env.FRONTEND_URL ?? 'http://localhost:4000';
        const trackingLink = `${origin}/book/track/${res.reservationToken}`;

        await this.emailService.sendPaymentReminder(
          res.customer.email,
          res.customer.firstName + ' ' + res.customer.lastName,
          trackingLink,
          res.eventType,
          res.advancePaymentPriceInCents ?? 0,
        );

        this.processedReminders.add(key);
      }

      // 2. Find CONFIRMED reservations happening within the next 24 hours
      const twentyFourHoursFromNow = new Date(
        now.getTime() + 24 * 60 * 60 * 1000,
      );
      const upcomingReservations = await this.reservationRepository.find({
        where: {
          status: ReservationStatus.CONFIRMED,
          date: LessThan(twentyFourHoursFromNow),
        },
        relations: { customer: true, photographer: true },
      });

      for (const res of upcomingReservations) {
        const customerKey = `upcoming_customer_${res.id}`;
        const photographerKey = `upcoming_photographer_${res.id}`;

        // Customer Reminder
        if (!this.processedReminders.has(customerKey)) {
          await this.emailService.sendUpcomingBookingReminder(
            res.customer.email,
            res.customer.firstName + ' ' + res.customer.lastName,
            'customer',
            res.photographer.firstName + ' ' + res.photographer.lastName,
            res.date.toString(),
          );
          this.processedReminders.add(customerKey);
        }

        // Photographer Reminder
        if (
          res.photographer &&
          res.photographer.reminderEmailsEnabled &&
          !this.processedReminders.has(photographerKey)
        ) {
          await this.emailService.sendUpcomingBookingReminder(
            res.photographer.email,
            res.photographer.firstName + ' ' + res.photographer.lastName,
            'photographer',
            res.customer.firstName + ' ' + res.customer.lastName,
            res.date.toString(),
          );
          this.processedReminders.add(photographerKey);
        }
      }
    } catch (err) {
      console.error('Error running reminders cron:', err);
    }
  }
}
