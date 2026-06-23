import { type PhotographerProfile } from "@/types";
import { Card } from "@/components/ui/card";

export function PhotographerHeader({ profile }: { profile: PhotographerProfile }) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      <div className="flex flex-col sm:flex-row gap-5 p-5 items-center sm:items-start text-center sm:text-left">
        {profile.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profileImageUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="h-24 w-24 shrink-0 rounded-full object-cover shadow-sm border border-zinc-200 dark:border-zinc-800"
          />
        ) : (
          <div className="h-24 w-24 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-title-medium font-bold border border-zinc-250 dark:border-zinc-800 shadow-inner">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
        )}
        <div className="space-y-2 flex-1">
          <h1 className="text-title-large font-bold text-zinc-900 dark:text-white leading-tight">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.bio && (
            <p className="text-body-small text-zinc-650 dark:text-zinc-350 leading-relaxed font-normal">
              {profile.bio}
            </p>
          )}
          {profile.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
              {profile.specializations.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-zinc-100/80 px-2.5 py-0.5 text-body-caption font-semibold dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200/10"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {profile.baseLocation && (
            <p className="text-body-caption text-zinc-450 dark:text-zinc-500 font-medium pt-0.5">
              📍 Based in {profile.baseLocation}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
