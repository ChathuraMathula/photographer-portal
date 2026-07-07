import { type TrackingReservation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag, MapPin } from "lucide-react";
import { OSMMapPreview } from "@/components/maps/OSMMapPreview";

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
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">
              Date &amp; Time
            </p>
            <p className="text-body-small mt-0.5 text-zinc-550 dark:text-zinc-450">
              {new Date(reservation.date).toDateString()} at{" "}
              {reservation.startTime} - {reservation.endTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-zinc-405 shrink-0" />
          <div>
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">
              Event Type
            </p>
            <p className="text-body-small mt-0.5 text-zinc-550 dark:text-zinc-450">{reservation.eventType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-zinc-405 shrink-0" />
          <div>
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">
              Location
            </p>
            <p className="text-body-small mt-0.5 text-zinc-550 dark:text-zinc-450 font-medium">
              {reservation.location || "Not specified"}
            </p>
            {(reservation.city || reservation.district) && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 uppercase tracking-wider">
                {reservation.city && `City: ${reservation.city}`}
                {reservation.district && ` | District: ${reservation.district}`}
              </p>
            )}
            {reservation.locationMapLink && (
              <a
                href={reservation.locationMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-all"
              >
                🗺️ View on Google Maps
              </a>
            )}
          </div>
        </div>
        {(reservation.location || reservation.locationMapLink || reservation.city || reservation.district) && (
          <div className="sm:col-span-2 border-t pt-4 mt-2 dark:border-zinc-800">
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Event Location Preview (OpenStreetMap)
            </p>
            <OSMMapPreview
              location={reservation.location}
              city={reservation.city}
              district={reservation.district}
              locationMapLink={reservation.locationMapLink}
              height="260px"
            />
          </div>
        )}
        {reservation.customerNotes && (
          <div className="sm:col-span-2 border-t pt-4 mt-2 dark:border-zinc-800">
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Your Notes
            </p>
            <p className="text-body-small italic text-zinc-500">"{reservation.customerNotes}"</p>
          </div>
        )}
        {(reservation.status === "CONFIRMED" || reservation.status === "COMPLETED") && reservation.totalAmountInCents && (
          <div className="sm:col-span-2 border-t pt-4 mt-2 dark:border-zinc-800 animate-in fade-in duration-300">
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Payment Summary
            </p>
            <div className="grid grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase">Total Price</p>
                <p className="font-bold text-zinc-950 dark:text-white mt-0.5">
                  LKR {((reservation.totalAmountInCents || 0) / 100).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase">Deposit Paid</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  LKR {((reservation.advancePaymentPriceInCents || 0) / 100).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase">Balance Due</p>
                <p className="font-bold text-zinc-950 dark:text-white mt-0.5">
                  LKR {(((reservation.totalAmountInCents || 0) - (reservation.advancePaymentPriceInCents || 0)) / 100).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
