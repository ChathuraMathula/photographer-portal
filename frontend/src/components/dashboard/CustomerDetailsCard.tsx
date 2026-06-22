import { type Reservation } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CustomerDetailsCard({ reservation }: { reservation: Reservation }) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Customer Request Details</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          Submitted on {new Date(reservation.date).toDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 text-body-small text-zinc-655 dark:text-zinc-450">
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
            <p className="text-body-caption text-zinc-500 mt-0.5">{reservation.location || "Location not given"}</p>
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
            <p className="text-body-small italic text-zinc-500 mt-0.5">"{reservation.customerNotes}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
