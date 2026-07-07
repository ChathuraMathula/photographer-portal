import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { FieldError } from "@/components/feedback/FieldError";
import { CalendarPickerPopup } from "./components/CalendarPickerPopup";

type Props = {
  value: string;
  onChange: (val: string) => void;
  today: string;
  error?: string;
};

export function CalendarPicker({ value, onChange, today, error }: Props) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [navDate, setNavDate] = useState(() => {
    const initial = value ? new Date(value) : new Date();
    return isNaN(initial.getTime()) ? new Date() : initial;
  });

  const getDateLabel = () => {
    if (!value) return "Select preferred date";
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) return value;
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrevMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setShowCalendar(false);
  };

  return (
    <div className="space-y-2 relative">
      <Button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={`w-full h-[50px] justify-start text-left font-normal bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border ${
          error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
        } rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center gap-2.5 shadow-sm`}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 shrink-0" />
        {getDateLabel()}
      </Button>
      {showCalendar && (
        <CalendarPickerPopup
          navDate={navDate}
          value={value}
          today={today}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      )}
      <FieldError msg={error} />
    </div>
  );
}
