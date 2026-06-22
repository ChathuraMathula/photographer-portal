import { type PhotographerProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PhotographerHeader({ profile }: { profile: PhotographerProfile }) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-title-large text-primary-dark dark:text-white">
          {profile.firstName} {profile.lastName}
        </CardTitle>
        {profile.bio && <CardDescription className="text-body-small text-zinc-500 mt-1.5">{profile.bio}</CardDescription>}
        {profile.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.specializations.map((s) => (
              <span
                key={s}
                className="rounded-full bg-zinc-100 px-3 py-1 text-body-small-s font-medium dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {profile.baseLocation && (
          <p className="pt-2 text-body-small text-zinc-500">{profile.baseLocation}</p>
        )}
      </CardHeader>
    </Card>
  );
}
