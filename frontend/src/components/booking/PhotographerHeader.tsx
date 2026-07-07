import { type PhotographerProfile } from "@/types";
import { Card } from "@/components/ui/card";
import { PhotographerHeaderInfo } from "./components/PhotographerHeaderInfo";
import { PhotographerHeaderMap } from "./components/PhotographerHeaderMap";

export function PhotographerHeader({ profile }: { profile: PhotographerProfile }) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
      <PhotographerHeaderInfo profile={profile} />
      <PhotographerHeaderMap profile={profile} />
    </Card>
  );
}
