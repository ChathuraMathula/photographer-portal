import { useState } from "react";
import { type Reservation } from "@/types";
import { OSMMapPreview } from "@/components/common/OSMMapPreview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

export function CustomerDetailsCard({ reservation }: { reservation: Reservation }) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(reservation.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = async () => {
    try {
      const originUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:4000";
      await navigator.clipboard.writeText(`${originUrl}/book/track/${reservation.reservationToken}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Customer Request Details</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          Submitted on {new Date(reservation.date).toDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 text-body-small text-zinc-655 dark:text-zinc-450">
        {/* Reservation Info & Tracking Link Copy Block */}
        <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-body-caption font-semibold text-zinc-400">Reservation ID</p>
              <p className="font-mono text-body-caption font-semibold text-zinc-700 dark:text-zinc-300 select-all">
                {reservation.id}
              </p>
            </div>
            <button
              onClick={handleCopyId}
              type="button"
              className="flex h-8 items-center gap-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-body-caption text-zinc-655 dark:text-zinc-350 hover:text-primary-dark dark:hover:text-white transition-all cursor-pointer font-semibold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none"
            >
              {copiedId ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          {reservation.reservationToken && (
            <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-850">
              <p className="text-body-caption font-semibold text-zinc-400 mb-1.5">Client Tracking Link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 block truncate rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 text-body-caption select-all text-zinc-650 dark:text-zinc-350">
                  {`${typeof window !== "undefined" ? window.location.origin : "http://localhost:4000"}/book/track/${reservation.reservationToken}`}
                </code>
                <button
                  onClick={handleCopyLink}
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-primary-dark dark:hover:text-white hover:border-zinc-350 dark:hover:border-zinc-750 transition-all cursor-pointer shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none"
                  title="Copy link"
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-body-caption font-semibold text-zinc-400">Client Name</p>
            <p className="text-body-small-s font-semibold text-zinc-950 dark:text-white">
              {reservation.customer.firstName} {reservation.customer.lastName}
            </p>
          </div>
          <div>
            <p className="text-body-caption font-semibold text-zinc-400">Contact</p>
            <p className="text-body-small-s text-zinc-700 dark:text-zinc-300 truncate">{reservation.customer.email}</p>
            <p className="text-body-caption text-zinc-400 mt-0.5">
              {reservation.customer.phone}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <div>
            <p className="text-body-caption font-semibold text-zinc-400">Date &amp; Location</p>
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">
              {reservation.startTime} - {reservation.endTime}
            </p>
            <p className="text-body-caption text-zinc-500 mt-0.5">
              {reservation.location || "Location not given"}
              {reservation.city && `, ${reservation.city}`}
              {reservation.district && `, ${reservation.district}`}
            </p>
            {reservation.locationMapLink && (
              <a
                href={reservation.locationMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-650 hover:text-blue-700 dark:text-blue-400 hover:underline transition-all"
              >
                🗺️ View on Google Maps
              </a>
            )}
          </div>
          <div>
            <p className="text-body-caption font-semibold text-zinc-400">Event</p>
            <p className="text-body-small-s font-semibold text-zinc-900 dark:text-zinc-100">
              {reservation.eventType}
            </p>
          </div>
        </div>
        {reservation.customerNotes && (
          <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <p className="text-body-caption font-semibold text-zinc-400">Client Notes</p>
            <p className="text-body-small italic text-zinc-500 mt-0.5 font-medium">"{reservation.customerNotes}"</p>
          </div>
        )}
        {(reservation.location || reservation.locationMapLink || reservation.city || reservation.district) && (
          <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <p className="text-body-caption font-semibold text-zinc-400 mb-2">Location Map Preview</p>
            <OSMMapPreview
              location={reservation.location}
              city={reservation.city}
              district={reservation.district}
              locationMapLink={reservation.locationMapLink}
              height="200px"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
