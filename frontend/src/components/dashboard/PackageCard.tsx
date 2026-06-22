import { type Package } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit3, Trash2 } from "lucide-react";

type Props = {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
};

export function PackageCard({ pkg, onEdit, onDelete }: Props) {
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-md font-bold">{pkg.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-zinc-500"
              onClick={() => onEdit(pkg)}
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-500"
              onClick={() => onDelete(pkg.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          Duration: {pkg.durationHours} hr(s)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pkg.description && (
          <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
            {pkg.description}
          </p>
        )}
        {pkg.includes.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Includes:
            </p>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 list-disc pl-4 space-y-0.5">
              {pkg.includes.map((inc) => (
                <li key={inc}>{inc}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-zinc-50/50 dark:bg-zinc-900/30 p-4 flex items-baseline gap-1">
        <span className="text-xs font-semibold text-zinc-400">LKR</span>
        <span className="text-lg font-bold text-zinc-950 dark:text-white">
          {(pkg.priceInCents / 100).toLocaleString()}
        </span>
      </CardFooter>
    </Card>
  );
}
