import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { Payment } from '../entities/payment.entity';
import { AnalyticsSyncService } from './analytics-sync.service';
import { InjectDataSource } from '@nestjs/typeorm';

@EventSubscriber()
export class AnalyticsSyncSubscriber implements EntitySubscriberInterface {
  constructor(
    private readonly syncService: AnalyticsSyncService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    // We want to listen to both, but typeorm subscriber listenTo can only return one entity or 'any'.
    // We will listen to any and filter in the methods.
    return 'all' as any; 
  }

  async afterInsert(event: InsertEvent<any>) {
    await this.handleEvent(event.entity);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    await this.handleEvent(event.entity);
  }

  async afterRemove(event: RemoveEvent<any>) {
    await this.handleEvent(event.entity);
  }

  private async handleEvent(entity: any) {
    if (!entity) return;

    if (entity instanceof Reservation || entity.constructor?.name === 'Reservation') {
      await this.syncService.syncReservation(entity.id);
    } else if (entity instanceof Payment || entity.constructor?.name === 'Payment') {
      if (entity.reservationId) {
        await this.syncService.syncReservation(entity.reservationId);
      }
    }
  }
}
