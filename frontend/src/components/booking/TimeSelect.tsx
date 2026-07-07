import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, ChevronDown } from "lucide-react";
import { FieldError } from "@/components/feedback/FieldError";

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00"
];

const formatTimeLabel = (timeStr: string) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hrs = parseInt(h, 10);
  return `${hrs % 12 === 0 ? 12 : hrs % 12}:${m} ${hrs >= 12 ? "PM" : "AM"}`;
};

type Props = { value: string; onChange: (t: string) => void; error?: string; placeholder?: string; startTimeFilter?: string };

export function TimeSelect({ value, onChange, error, placeholder = "Select time", startTimeFilter }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2 relative">
      <Button type="button" onClick={() => setShow(!show)} className={`w-full h-[50px] justify-between bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border ${error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"} rounded-xl px-4 flex items-center shadow-sm text-zinc-800 dark:text-zinc-200`}>
        <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-zinc-500 shrink-0" />{value ? formatTimeLabel(value) : placeholder}</span>
        <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
      </Button>
      {show && (
        <>
          <div className="fixed inset-0 z-35 bg-transparent" onClick={() => setShow(false)} />
          <div className="absolute top-[55px] left-0 z-40 w-full max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200/60 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            {TIME_SLOTS.map((s) => {
              const isDisabled = !!(startTimeFilter && s <= startTimeFilter);
              return (
                <button key={s} type="button" disabled={isDisabled} onClick={() => { onChange(s); setShow(false); }} className={`w-full text-left px-4 py-2 text-body-caption transition-colors ${isDisabled ? "text-zinc-300 dark:text-zinc-700 pointer-events-none bg-zinc-50/30 dark:bg-zinc-950/20" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"} ${value === s ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""}`}>
                  {formatTimeLabel(s)}
                </button>
              );
            })}
          </div>
        </>
      )}
      <FieldError msg={error} />
    </div>
  );
}
