import { type Reservation } from "@/types";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationListItem } from "./ReservationListItem";

type Props = {
  reservations: Reservation[];
  selectedId: string | undefined;
  onSelect: (res: Reservation) => void;
};

export function ReservationList({ reservations, selectedId, onSelect }: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm h-[600px] flex flex-col rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-body-base-bold text-primary-dark dark:text-white">Requests List</CardTitle>
          <span className="inline-flex rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-body-caption font-semibold text-zinc-700 dark:text-zinc-300">
            Total: {reservations.length}
          </span>
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 scrollbar-hide">
        {reservations.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-body-small">
            No reservations found.
          </div>
        ) : (
          reservations.map((res) => (
            <ReservationListItem
              key={res.id}
              reservation={res}
              isSelected={selectedId === res.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </Card>
  );
}
