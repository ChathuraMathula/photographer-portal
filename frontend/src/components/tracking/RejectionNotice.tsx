import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RejectionNotice({ reason }: { reason?: string }) {
  return (
    <Card className="border border-red-200/60 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-title-medium text-red-700 dark:text-red-400">
          Update from Photographer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-body-small text-red-955 dark:text-red-300">
        <p className="italic">
          "{reason || "The photographer is unavailable for this date/time."}"
        </p>
      </CardContent>
    </Card>
  );
}
