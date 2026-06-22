import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  photographerFirstName: string;
  trackingToken: string;
  origin: string;
};

export function BookingConfirmed({ photographerFirstName, trackingToken, origin }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-emerald-600">Request Submitted!</CardTitle>
        <CardDescription>
          Your request has been sent to {photographerFirstName}. They will
          contact you to confirm the details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Save this link to track your reservation status:
        </p>
        <code className="block break-all rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
          {origin}/book/track/{trackingToken}
        </code>
      </CardContent>
    </Card>
  );
}
