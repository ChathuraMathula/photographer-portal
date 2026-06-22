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
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader className="pb-3 border-b dark:border-zinc-800">
        <CardTitle className="text-md">Customer Request Details</CardTitle>
        <CardDescription>
          Submitted on {new Date(reservation.date).toDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 text-sm text-zinc-600 dark:text-zinc-450">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-400">Client Name</p>
            <p className="font-semibold text-zinc-950 dark:text-white">
              {reservation.customer.firstName} {reservation.customer.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">Contact</p>
            <p>{reservation.customer.email}</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {reservation.customer.phone}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t pt-3 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400">Date &amp; Location</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {reservation.startTime} - {reservation.endTime}
            </p>
            <p className="text-xs">{reservation.location || "Location not given"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">Event</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {reservation.eventType}
            </p>
          </div>
        </div>
        {reservation.customerNotes && (
          <div className="border-t pt-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-400">Client Notes</p>
            <p className="italic">"{reservation.customerNotes}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
