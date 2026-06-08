import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Reservation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  photographerId!: Types.ObjectId;

  @Prop({ required: true })
  date!: Date;

  // 24-hour format strings ("08:00", "17:30") — easy to compare lexicographically
  @Prop({ required: true })
  startTime!: string;

  @Prop({ required: true })
  endTime!: string;

  @Prop({ required: true })
  eventType!: string;

  @Prop()
  location?: string;

  @Prop()
  customerNotes?: string;

  // Internal fields — never exposed to customers
  @Prop()
  adminNotes?: string;

  @Prop({ min: 0 })
  totalAmountInCents?: number;

  @Prop({ required: true, enum: ReservationStatus, default: ReservationStatus.PENDING })
  status!: ReservationStatus;

  @Prop({ required: true, unique: true })
  reservationToken!: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
