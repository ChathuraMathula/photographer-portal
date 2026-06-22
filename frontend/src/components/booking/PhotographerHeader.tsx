import { type PhotographerProfile } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function PhotographerHeader({ profile }: { profile: PhotographerProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {profile.firstName} {profile.lastName}
        </CardTitle>
        {profile.bio && <CardDescription>{profile.bio}</CardDescription>}
        {profile.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.specializations.map((s) => (
              <span
                key={s}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-800"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {profile.baseLocation && (
          <p className="pt-1 text-sm text-zinc-500">{profile.baseLocation}</p>
        )}
      </CardHeader>
    </Card>
  );
}
