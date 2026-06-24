import { useState, useEffect } from "react";
import { type Reservation } from "@/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Calendar, Clock, MapPin, Phone, Mail, User, Tag, X, Copy, Check } from "lucide-react";

type Props = {
  reservation: Reservation;
  onClose: () => void;
  onNavigateToReservation: (res: Reservation) => void;
};

export function BookingDetailsModal({
  reservation,
  onClose,
  onNavigateToReservation,
}: Props) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (reservation) {
      const key = `chat_last_viewed_photographer_${reservation.id}`;
      localStorage.setItem(key, new Date().toISOString());
    }
  }, [reservation]);

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

  const formattedDate = new Date(reservation.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 shrink-0">
          <div className="space-y-1">
            <h2 className="text-title-medium text-primary-dark dark:text-white font-bold">
              Booking Details
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-body-caption text-zinc-400 font-semibold">Status:</span>
              <StatusBadge status={reservation.status} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer animate-in fade-in duration-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-zinc-655 dark:text-zinc-400 custom-scrollbar">
          
          {/* Reservation ID & Tracking Link Section */}
          <div className="space-y-3">
            <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-body-caption font-semibold text-zinc-400">Reservation ID</p>
                  <p className="font-mono text-body-caption font-semibold text-zinc-700 dark:text-zinc-300 select-all">
                    {reservation.id}
                  </p>
                </div>
                <Button
                  onClick={handleCopyId}
                  className="flex h-8 items-center gap-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-855 bg-white dark:bg-zinc-950 text-body-caption text-zinc-600 dark:text-zinc-400 hover:text-primary-dark dark:hover:text-white transition-all cursor-pointer font-semibold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  {copiedId ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-650" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              {reservation.reservationToken && (
                <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-850">
                  <p className="text-body-caption font-semibold text-zinc-400 mb-1.5">Client Tracking Link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 block truncate rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2.5 text-body-caption select-all text-zinc-655 dark:text-zinc-355">
                      {`${typeof window !== "undefined" ? window.location.origin : "http://localhost:4000"}/book/track/${reservation.reservationToken}`}
                    </code>
                    <Button
                      onClick={handleCopyLink}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-primary-dark dark:hover:text-white hover:border-zinc-350 dark:hover:border-zinc-750 transition-all cursor-pointer shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 p-0"
                      title="Copy link"
                    >
                      {copiedLink ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Client Details Section */}
          <div className="space-y-3">
            <h3 className="text-body-base-bold text-primary-dark dark:text-white flex items-center gap-2 font-semibold">
              <User className="h-4 w-4 text-zinc-450" /> Client Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
              <div>
                <p className="text-body-caption font-semibold text-zinc-400">Full Name</p>
                <p className="text-body-small-s font-semibold text-zinc-950 dark:text-white">
                  {reservation.customer.firstName} {reservation.customer.lastName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-body-caption font-semibold text-zinc-400">Contacts</p>
                <p className="text-body-small-s text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 text-zinc-400" /> {reservation.customer.email}
                </p>
                <p className="text-body-small-s text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-zinc-400" /> {reservation.customer.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="space-y-3">
            <h3 className="text-body-base-bold text-primary-dark dark:text-white flex items-center gap-2 font-semibold">
              <Calendar className="h-4 w-4 text-zinc-450" /> Event Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
              <div className="space-y-2">
                <div>
                  <p className="text-body-caption font-semibold text-zinc-400">Event Date</p>
                  <p className="text-body-small-s font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" /> {formattedDate}
                  </p>
                </div>
                <div>
                  <p className="text-body-caption font-semibold text-zinc-400">Time Range</p>
                  <p className="text-body-small-s font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" /> {reservation.startTime} – {reservation.endTime}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-body-caption font-semibold text-zinc-400">Event Type</p>
                  <p className="text-body-small-s font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-zinc-400" /> {reservation.eventType}
                  </p>
                </div>
                <div>
                  <p className="text-body-caption font-semibold text-zinc-400">Location</p>
                  <p className="text-body-small-s font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" /> {reservation.location || "Offline / Not Provided"}
                  </p>
                  {reservation.locationMapLink && (
                    <a
                      href={reservation.locationMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-body-caption font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-all"
                    >
                      🗺️ View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Notes */}
          {reservation.customerNotes && (
            <div className="space-y-1.5 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <p className="text-body-caption font-semibold text-zinc-400">Client's Event Notes</p>
              <p className="text-body-small italic text-zinc-600 dark:text-zinc-350 bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                "{reservation.customerNotes}"
              </p>
            </div>
          )}

          {/* Proposal / Package selections details */}
          {((reservation.selectedPackages && reservation.selectedPackages.length > 0) || reservation.totalAmountInCents) && (
            <div className="space-y-3 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <h3 className="text-body-base-bold text-primary-dark dark:text-white font-semibold">
                Proposal &amp; Package Details
              </h3>
              <div className="space-y-2 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                {reservation.clientSelectedPackageId && reservation.selectedPackages && (
                  <div>
                    <p className="text-body-caption font-semibold text-zinc-400">Selected Option</p>
                    <p className="text-body-small-s font-semibold text-primary-dark dark:text-white">
                      {reservation.selectedPackages.find(p => p.id === reservation.clientSelectedPackageId)?.name || "Standard Option"}
                    </p>
                  </div>
                )}
                {reservation.selectedPackages && reservation.selectedPackages.length > 0 && !reservation.clientSelectedPackageId && (
                  <div>
                    <p className="text-body-caption font-semibold text-zinc-400">Proposed Packages</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-body-small-s text-zinc-700 dark:text-zinc-300">
                      {reservation.selectedPackages.map((pkg) => (
                        <li key={pkg.id}>
                          <strong>{pkg.name}</strong> – LKR {(pkg.priceInCents / 100).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
                  {reservation.totalAmountInCents && (
                    <div>
                      <p className="text-body-caption font-semibold text-zinc-400">Total Price</p>
                      <p className="text-body-small-s font-bold text-zinc-950 dark:text-white">
                        LKR {(reservation.totalAmountInCents / 100).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {reservation.advancePaymentPriceInCents && (
                    <div>
                      <p className="text-body-caption font-semibold text-zinc-400">Advance Requested</p>
                      <p className="text-body-small-s font-bold text-zinc-950 dark:text-white">
                        LKR {(reservation.advancePaymentPriceInCents / 100).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {reservation.quotationNotes && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 mt-2">
                    <p className="text-body-caption font-semibold text-zinc-400">Quotation Notes</p>
                    <p className="text-body-small-s italic text-zinc-550 dark:text-zinc-400">
                      "{reservation.quotationNotes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejection Details */}
          {reservation.rejectionReason && (
            <div className="space-y-1.5 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <p className="text-body-caption font-semibold text-zinc-400">Rejection Reason</p>
              <p className="text-body-small text-red-650 dark:text-red-400 bg-red-50/30 dark:bg-red-950/10 p-3 rounded-xl border border-red-100/55 dark:border-red-900/35 italic">
                "{reservation.rejectionReason}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 dark:border-zinc-800 grid grid-cols-2 gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="btn btn-secondary btn-modal h-11 px-6 text-body-small-s cursor-pointer animate-in fade-in duration-100"
          >
            Close Dialog
          </Button>
          <Button
            type="button"
            onClick={() => onNavigateToReservation(reservation)}
            className="btn btn-primary btn-modal h-11 px-6 text-body-small-s shadow-sm font-semibold cursor-pointer animate-in fade-in duration-100"
          >
            View Reservation &amp; Chat
          </Button>
        </div>

      </div>
    </div>
  );
}
