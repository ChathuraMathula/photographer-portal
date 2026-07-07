import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ArrowUpRight } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

type Props = {
  data: any;
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  search: string;
  setSearch: (s: string) => void;
};

export function AdminLeaderboard({
  data,
  loading,
  page,
  setPage,
  search,
  setSearch,
}: Props) {
  if (!data) return null;
  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-body-base-bold font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" /> Photographer
              Performance Leaderboard
            </CardTitle>
            <CardDescription className="text-xs">
              Top performing photographers sorted by total settled volume.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search photographers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] rounded-b-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-small">
            <thead>
              <tr className="border-b border-zinc-150 bg-zinc-55/10 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-body-small-s font-semibold">
                <th className="p-4">Rank</th>
                <th className="p-4">Photographer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Settled Bookings</th>
                <th className="p-4 text-right">Settled Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.data.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-zinc-400 italic"
                  >
                    No photographers found.
                  </td>
                </tr>
              ) : (
                data.data.map((row: any, idx: number) => {
                  const absoluteRank = (page - 1) * 5 + idx + 1;
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20"
                    >
                      <td className="p-4 font-bold text-zinc-400">
                        #{absoluteRank}
                      </td>
                      <td className="p-4 font-semibold text-zinc-900 dark:text-white">
                        {row.name}
                      </td>
                      <td className="p-4 text-zinc-555 dark:text-zinc-405">
                        {row.email}
                      </td>
                      <td className="p-4 text-center font-medium">
                        {row.bookingsCount}
                      </td>
                      <td className="p-4 text-right font-bold text-emerald-700 dark:text-emerald-450">
                        LKR {row.revenueLkr.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {data.totalPages > 1 && (
          <div className="p-4 flex justify-center border-t border-zinc-100 dark:border-zinc-800 mt-auto">
            <Pagination
              page={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
