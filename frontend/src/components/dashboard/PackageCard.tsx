import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit3, Trash2 } from "lucide-react";
import { PackageCardFooter } from "./package-card/components/PackageCardFooter";

type Props = {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
};

export function PackageCard({ pkg, onEdit, onDelete }: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between overflow-hidden rounded-xl">
      <CardHeader className="pb-3 bg-zinc-50/20 border-b border-zinc-100 dark:border-zinc-850">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-title-base text-primary-dark dark:text-white">
            {pkg.name}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 cursor-pointer"
              onClick={() => onEdit(pkg)}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
              onClick={() => onDelete(pkg.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-body-caption text-zinc-500 mt-1">
          Duration: {pkg.durationHours} hr(s)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 flex-1">
        {pkg.description && (
          <p className="text-body-small-s text-zinc-550 line-clamp-3 leading-relaxed">
            {pkg.description}
          </p>
        )}
        {pkg.includes.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Includes:
            </p>
            <ul className="text-body-caption text-zinc-600 dark:text-zinc-400 list-disc pl-4 space-y-0.5">
              {pkg.includes.map((inc) => (
                <li key={inc}>{inc}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <PackageCardFooter pkg={pkg} />
    </Card>
  );
}
