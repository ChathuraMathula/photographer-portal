import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PhotographerProfile extends Document {
  // 1-to-1 with a User whose role is PHOTOGRAPHER
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  // URL-safe slug used in the public booking link: /book/<bookingSlug>
  @Prop({ required: true, unique: true })
  bookingSlug!: string;

  @Prop()
  bio?: string;

  @Prop({ type: [String], default: [] })
  specializations!: string[];

  @Prop()
  portfolioUrl?: string;

  @Prop()
  profileImageUrl?: string;

  @Prop()
  baseLocation?: string;

  @Prop({ default: true })
  isAvailableForBooking!: boolean;
}

export const PhotographerProfileSchema =
  SchemaFactory.createForClass(PhotographerProfile);
