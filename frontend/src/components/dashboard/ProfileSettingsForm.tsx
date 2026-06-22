import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  bio: string;
  location: string;
  portfolio: string;
  onBioChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onPortfolioChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ProfileSettingsForm({
  bio,
  location,
  portfolio,
  onBioChange,
  onLocationChange,
  onPortfolioChange,
  onSubmit,
}: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>
          Update biography and booking slug settings
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profBio">Short Biography</Label>
            <textarea
              id="profBio"
              rows={4}
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              placeholder="Describe your style, experience..."
              className="w-full rounded-md border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profLoc">Base Location</Label>
              <Input
                id="profLoc"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. Colombo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profPort">Portfolio URL</Label>
              <Input
                id="profPort"
                value={portfolio}
                onChange={(e) => onPortfolioChange(e.target.value)}
                placeholder="e.g. https://myportfolio.com"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 dark:border-zinc-800 flex justify-end">
          <Button type="submit">Save Settings</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
