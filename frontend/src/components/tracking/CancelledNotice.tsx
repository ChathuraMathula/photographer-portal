import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function CancelledNotice() {
  return (
    <Card className="border-zinc-200 bg-zinc-50 dark:bg-zinc-900/30 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-2 text-zinc-700 dark:text-zinc-300">
        <AlertCircle className="h-5 w-5 text-zinc-500" />
        <CardTitle className="text-lg">Quotation Expired</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-zinc-500">
        The photographer proposed options, but the 24-hour booking reservation
        period expired before selection could be confirmed. The time slot is
        once again available to other clients.
      </CardContent>
    </Card>
  );
}
