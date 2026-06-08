import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Package extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  photographerId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  // Integer cents to avoid floating-point precision issues.
  // Example: LKR 85,000 is stored as 8_500_000 (85000 * 100)
  @Prop({ required: true, min: 0 })
  priceInCents!: number;

  @Prop({ required: true, min: 0 })
  durationHours!: number;

  // What is included in this package (e.g. ['Ceremony coverage', '200 edited photos'])
  @Prop({ type: [String], default: [] })
  includes!: string[];

  @Prop({ default: true })
  isActive!: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
