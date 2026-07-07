import { MapPin } from "lucide-react";
import { type TrackingReservation } from "@/types";
import { OSMMapPreview } from "@/components/maps/OSMMapPreview";

export function BookingSummaryLocationInfo({
  reservation,
}: {
  reservation: TrackingReservation;
}) {
  return (
    <>
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
      {(reservation.location ||
        reservation.locationMapLink ||
        reservation.city ||
        reservation.district) && (
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
    </>
  );
}
