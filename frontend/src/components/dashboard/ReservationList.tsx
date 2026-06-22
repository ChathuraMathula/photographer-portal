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
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold">Requests List</CardTitle>
          <span className="inline-flex rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            Total: {reservations.length}
          </span>
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
        {reservations.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm">
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
