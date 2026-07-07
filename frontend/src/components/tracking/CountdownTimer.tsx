import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

type Props = {
  deadline: string;
};

export function CountdownTimer({ deadline }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      return Math.max(0, diff);
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newDiff = calculateTimeLeft();
      setTimeLeft(newDiff);
      if (newDiff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (timeLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 font-bold text-body-caption">
        <Clock className="h-3.5 w-3.5" />
        Expired
      </span>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  const isUrgent = hours < 6;

  return (
    <div className="flex items-center gap-1.5 font-mono">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-body-caption font-bold transition-all shadow-sm ${
          isUrgent
            ? "bg-red-500 text-white animate-pulse"
            : "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
        }`}
      >
        <Clock
          className={`h-3.5 w-3.5 ${isUrgent ? "animate-spin" : ""}`}
          style={{ animationDuration: isUrgent ? "4s" : "0s" }}
        />
        <span>Slot locked: </span>
        <span className="tracking-wider">
          {formattedHours}h {formattedMinutes}m {formattedSeconds}s
        </span>
        <span className="text-body-caption uppercase font-bold opacity-90 shrink-0">
          remaining
        </span>
      </span>
    </div>
  );
}
