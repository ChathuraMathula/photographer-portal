import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RejectionNotice({ reason }: { reason?: string }) {
  return (
    <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50">
      <CardHeader>
        <CardTitle className="text-red-700 dark:text-red-400">
          Update from Photographer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-red-950 dark:text-red-300">
        <p className="italic">
          "{reason || "The photographer is unavailable for this date/time."}"
        </p>
      </CardContent>
    </Card>
  );
}
