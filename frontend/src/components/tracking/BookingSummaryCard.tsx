import { type TrackingReservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag } from "lucide-react";
import { BookingSummaryLocationInfo } from "./components/BookingSummaryLocationInfo";
import { BookingSummaryPaymentInfo } from "./components/BookingSummaryPaymentInfo";

export function BookingSummaryCard({ reservation }: { reservation: TrackingReservation }) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 text-body-small text-zinc-650 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-zinc-405 shrink-0" />
          <div>
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">Date &amp; Time</p>
            <p className="text-body-small mt-0.5 text-zinc-550 dark:text-zinc-450">
              {new Date(reservation.date).toDateString()} at {reservation.startTime} - {reservation.endTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-zinc-405 shrink-0" />
          <div>
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">Event Type</p>
            <p className="text-body-small mt-0.5 text-zinc-550 dark:text-zinc-450">{reservation.eventType}</p>
          </div>
        </div>
        
        <BookingSummaryLocationInfo reservation={reservation} />

        {reservation.customerNotes && (
          <div className="sm:col-span-2 border-t pt-4 mt-2 dark:border-zinc-800">
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Your Notes</p>
            <p className="text-body-small italic text-zinc-500">"{reservation.customerNotes}"</p>
          </div>
        )}
        
        <BookingSummaryPaymentInfo reservation={reservation} />
      </CardContent>
    </Card>
  );
}
