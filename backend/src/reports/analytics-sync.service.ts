import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { PaymentStatus } from '../entities/payment.entity';

export const INDEX_NAME = 'reservations_analytics';

@Injectable()
export class AnalyticsSyncService implements OnModuleInit {
  constructor(
    private readonly esService: ElasticsearchService,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async onModuleInit() {
    await this.initIndex();
  }

  private async initIndex() {
    const indexExists = await this.esService.indices.exists({ index: INDEX_NAME });
    if (!indexExists) {
      await this.esService.indices.create({
        index: INDEX_NAME,
        mappings: {
          properties: {
            id: { type: 'keyword' },
            date: { type: 'date' },
            photographerId: { type: 'keyword' },
            photographerName: { type: 'keyword' },
            photographerEmail: { type: 'keyword' },
            customerId: { type: 'keyword' },
            status: { type: 'keyword' },
            eventType: { type: 'keyword' },
            packageName: { type: 'keyword' },
            totalAmountInCents: { type: 'integer' },
            paidAmountInCents: { type: 'integer' },
            district: { type: 'keyword' },
            city: { type: 'keyword' },
            locationMapLink: { type: 'keyword' },
            location: { type: 'keyword' },
            createdAt: { type: 'date' },
          },
        },
      });
      console.log(`[Elasticsearch] Index ${INDEX_NAME} created.`);
    }
  }

  async syncReservation(reservationId: string) {
    const res = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: {
        photographer: true,
        customer: true,
        payments: true,
      },
    });

    if (!res) {
      // If deleted, remove from ES
      await this.esService.delete({ index: INDEX_NAME, id: reservationId }).catch(() => {});
      return;
    }

    let pkgName = 'Custom/Quotation';
    if (res.selectedPackages && Array.isArray(res.selectedPackages) && res.selectedPackages.length > 0) {
      pkgName = res.selectedPackages[0].name || pkgName;
    }

    const paidAmountInCents = res.payments
      ?.filter((p) => p.status === PaymentStatus.SUCCESS)
      .reduce((sum, p) => sum + p.amountInCents, 0) || 0;

    const doc = {
      id: res.id,
      date: res.date,
      photographerId: res.photographerId,
      photographerName: res.photographer ? `${res.photographer.firstName} ${res.photographer.lastName}` : 'Unknown',
      photographerEmail: res.photographer?.email || '',
      customerId: res.customerId,
      status: res.status,
      eventType: res.eventType || 'Other',
      packageName: pkgName,
      totalAmountInCents: res.totalAmountInCents || 0,
      paidAmountInCents,
      district: res.district,
      city: res.city,
      locationMapLink: res.locationMapLink,
      location: res.location,
      createdAt: res.createdAt,
    };

    await this.esService.index({
      index: INDEX_NAME,
      id: res.id,
      document: doc,
    });
    console.log(`[Elasticsearch] Synced reservation ${res.id}`);
  }

  async bulkSyncAll() {
    const reservations = await this.reservationRepository.find({ select: { id: true } });
    console.log(`[Elasticsearch] Starting bulk sync of ${reservations.length} reservations...`);
    for (const r of reservations) {
      await this.syncReservation(r.id);
    }
    console.log(`[Elasticsearch] Bulk sync complete.`);
  }
}
