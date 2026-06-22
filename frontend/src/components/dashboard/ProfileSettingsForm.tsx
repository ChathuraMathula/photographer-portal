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
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm max-w-2xl mx-auto rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-850 bg-zinc-50/20">
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Profile Details</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          Update biography and booking slug settings
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="profBio" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Short Biography</Label>
            <textarea
              id="profBio"
              rows={4}
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              placeholder="Describe your style, experience..."
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-body-small focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-850 dark:bg-zinc-950 text-zinc-750 dark:text-zinc-305 transition-all"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profLoc" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Base Location</Label>
              <Input
                id="profLoc"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="e.g. Colombo"
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profPort" className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">Portfolio URL</Label>
              <Input
                id="profPort"
                value={portfolio}
                onChange={(e) => onPortfolioChange(e.target.value)}
                placeholder="e.g. https://myportfolio.com"
                className="h-11 rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-zinc-100 dark:border-zinc-850 pt-4 dark:border-zinc-800 flex justify-end">
          <Button
            type="submit"
            className="btn btn-primary h-11 py-0 min-w-0 md:min-w-0 px-8 shadow-sm"
          >
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
