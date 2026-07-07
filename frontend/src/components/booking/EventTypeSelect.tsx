import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { FieldError } from "@/components/feedback/FieldError";

type Props = {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  allowedEventTypes: string[];
  allowCustomEventTypes: boolean;
};

export function EventTypeSelect({
  value,
  onChange,
  error,
  allowedEventTypes,
  allowCustomEventTypes,
}: Props) {
  const [showEventTypes, setShowEventTypes] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customEventValue, setCustomEventValue] = useState("");

  // Re-synchronize when formik value updates or edits occur
  useEffect(() => {
    if (value && allowedEventTypes.length > 0) {
      const isPredefined = allowedEventTypes.includes(value);
      if (!isPredefined && value !== "") {
        setIsOtherSelected(true);
        setCustomEventValue(value);
      } else {
        setIsOtherSelected(false);
      }
    }
  }, [value, allowedEventTypes]);

  const handleSelectEventType = (val: string) => {
    if (val === "OTHER_OPTION") {
      setIsOtherSelected(true);
      onChange("");
    } else {
      setIsOtherSelected(false);
      onChange(val);
    }
    setShowEventTypes(false);
  };

  const handleCustomEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomEventValue(val);
    onChange(val);
  };

  if (allowedEventTypes.length === 0) {
    // Fallback to basic text input if photographer hasn't set any preferred event types
    return (
      <div className="space-y-2">
        <Input
          id="eventType"
          placeholder="e.g. Wedding, Portrait, Corporate Event"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
            error ? "border-red-500" : ""
          }`}
        />
        <FieldError msg={error} />
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
      <Button
        type="button"
        onClick={() => setShowEventTypes(!showEventTypes)}
        className={`w-full h-[50px] justify-between bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border ${
          error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
        } rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center shadow-sm`}
      >
        <span>
          {isOtherSelected
            ? "Other (Specify Custom Type)"
            : value
            ? value
            : "Select event type"}
        </span>
        <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
      </Button>

      {showEventTypes && (
        <>
          <div
            className="fixed inset-0 z-35 bg-transparent"
            onClick={() => setShowEventTypes(false)}
          />
          <div className="absolute top-[55px] left-0 z-40 w-full max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200/60 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            {allowedEventTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectEventType(type)}
                className={`w-full text-left px-4 py-2 text-body-caption hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                  !isOtherSelected && value === type ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""
                }`}
              >
                {type}
              </button>
            ))}
            {allowCustomEventTypes && (
              <button
                type="button"
                onClick={() => handleSelectEventType("OTHER_OPTION")}
                className={`w-full text-left px-4 py-2 text-body-caption hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800 text-zinc-500 font-medium ${
                  isOtherSelected ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""
                }`}
              >
                Other (Specify Custom Type)
              </button>
            )}
          </div>
        </>
      )}

      {isOtherSelected && (
        <div className="pt-1.5 animate-in slide-in-from-top-1.5 duration-200">
          <Input
            id="customEventTypeInput"
            placeholder="Specify your custom event type here..."
            value={customEventValue}
            onChange={handleCustomEventChange}
            className="h-[50px] rounded-xl border-zinc-200 dark:border-zinc-850 dark:bg-zinc-950 text-body-small-s focus:ring-primary-dark"
          />
        </div>
      )}
      <FieldError msg={error} />
    </div>
  );
}
