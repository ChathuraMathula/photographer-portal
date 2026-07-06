import { UserRole } from "@/store/slices/authSlice";

// ── Shared entity types ───────────────────────────────────────────────────────

export type Package = {
  id: string;
  name: string;
  description?: string;
  priceInCents: number;
  durationHours: number;
  includes: string[];
  isActive: boolean;
  depositType?: string;
  depositValue?: number;
  customDepositAmountInCents?: number | null;
  isCustom?: boolean;
};

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ReservationStatus =
  | "PENDING"
  | "PROPOSED"
  | "REJECTED"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type Reservation = {
  id: string;
  status: ReservationStatus;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location?: string;
  locationMapLink?: string;
  city?: string;
  district?: string;
  customerNotes?: string;
  adminNotes?: string;
  totalAmountInCents?: number;
  paymentDeadline?: string;
  advancePaymentPriceInCents?: number;
  quotationNotes?: string;
  clientSelectedPackageId?: string;
  selectedPackages?: Package[];
  rejectionReason?: string;
  customer: Customer;
  photographer: { id: string; firstName: string; lastName: string };
  reservationToken?: string;
  messages?: ChatMessage[];
};

export type ChatMessage = {
  id: string;
  sender: "PHOTOGRAPHER" | "CUSTOMER";
  senderName: string;
  content: string;
  timestamp: string;
};

export type PhotographerProfile = {
  bookingSlug: string;
  firstName: string;
  lastName: string;
  bio?: string;
  specializations: string[];
  baseLocation?: string;
  city?: string;
  district?: string;
  locationMapLink?: string;
  showMapPreviewOnBookingPage?: boolean;
  isAvailableForBooking: boolean;
  profileImageUrl?: string;
  allowedEventTypes?: string[];
  allowCustomEventTypes?: boolean;
  universalDepositType?: string;
  universalDepositValue?: number;
  offlineMessage?: string;
};

export type TrackingReservation = {
  id: string;
  status: ReservationStatus;
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location?: string;
  locationMapLink?: string;
  city?: string;
  district?: string;
  customerNotes?: string;
  advancePaymentPriceInCents?: number;
  totalAmountInCents?: number;
  totalPaidInCents?: number;
  quotationNotes?: string;
  clientSelectedPackageId?: string;
  selectedPackages?: Package[];
  paymentDeadline?: string;
  rejectionReason?: string;
  photographer: { firstName: string; lastName: string; bookingSlug?: string };
};

export type UserProfile = {
  bookingSlug: string;
  bio?: string;
  baseLocation?: string;
  specializations: string[];
  offlineMessage?: string;
};

export type UserAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  profile?: UserProfile;
};

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "booking" | "chat";
  referenceId: string;
};
