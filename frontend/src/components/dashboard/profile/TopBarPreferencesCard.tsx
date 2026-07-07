import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Settings, PlusSquare, CalendarCheck } from "lucide-react";

type Props = {
  showManualBookingInTopbar: boolean;
  onShowManualBookingInTopbarChange: (v: boolean) => void;
  showAcceptBookingsInTopbar: boolean;
  onShowAcceptBookingsInTopbarChange: (v: boolean) => void;
};

export function TopBarPreferencesCard({
  showManualBookingInTopbar,
  onShowManualBookingInTopbarChange,
  showAcceptBookingsInTopbar,
  onShowAcceptBookingsInTopbarChange,
}: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 transition-all">
      <CardHeader className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-150 dark:border-zinc-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-500">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white leading-none">
              Top Bar Preferences
            </CardTitle>
            <CardDescription className="text-body-caption text-zinc-500 mt-1.5">
              Customize quick actions available in your global navigation bar.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-zinc-500" />
              <p className="text-body-small-s font-bold text-zinc-900 dark:text-white leading-none">
                Accepting Bookings Toggle
              </p>
            </div>
            <p className="text-[11px] text-zinc-500 max-w-sm">
              Show the availability toggle in the top bar to easily pause or
              resume incoming bookings.
            </p>
          </div>
          <Switch
            checked={showAcceptBookingsInTopbar}
            onCheckedChange={onShowAcceptBookingsInTopbarChange}
          />
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-850" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PlusSquare className="h-4 w-4 text-zinc-500" />
              <p className="text-body-small-s font-bold text-zinc-900 dark:text-white leading-none">
                Add Manual Booking Button
              </p>
            </div>
            <p className="text-[11px] text-zinc-500 max-w-sm">
              Show the shortcut to manually log offline bookings from anywhere
              in the dashboard.
            </p>
          </div>
          <Switch
            checked={showManualBookingInTopbar}
            onCheckedChange={onShowManualBookingInTopbarChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
