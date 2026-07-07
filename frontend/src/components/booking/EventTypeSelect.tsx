import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import { FieldError } from "@/components/feedback/FieldError";
import { EventTypeSelectPopup } from "./components/EventTypeSelectPopup";

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

  useEffect(() => {
    if (value && allowedEventTypes.length > 0) {
      if (!allowedEventTypes.includes(value) && value !== "") {
        setIsOtherSelected(true);
        setCustomEventValue(value);
      } else setIsOtherSelected(false);
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

  if (allowedEventTypes.length === 0)
    return (
      <div className="space-y-2">
        <Input
          id="eventType"
          placeholder="e.g. Wedding, Portrait, Corporate Event"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${error ? "border-red-500" : ""}`}
        />
        <FieldError msg={error} />
      </div>
    );

  return (
    <div className="space-y-2 relative">
      <Button
        type="button"
        onClick={() => setShowEventTypes(!showEventTypes)}
        className={`w-full h-[50px] justify-between bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border ${error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"} rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center shadow-sm`}
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
        <EventTypeSelectPopup
          allowedEventTypes={allowedEventTypes}
          allowCustomEventTypes={allowCustomEventTypes}
          value={value}
          isOtherSelected={isOtherSelected}
          onSelect={handleSelectEventType}
          onClose={() => setShowEventTypes(false)}
        />
      )}
      {isOtherSelected && (
        <div className="pt-1.5 animate-in slide-in-from-top-1.5 duration-200">
          <Input
            id="customEventTypeInput"
            placeholder="Specify your custom event type here..."
            value={customEventValue}
            onChange={(e) => {
              setCustomEventValue(e.target.value);
              onChange(e.target.value);
            }}
            className="h-[50px] rounded-xl border-zinc-200 dark:border-zinc-850 dark:bg-zinc-950 text-body-small-s focus:ring-primary-dark"
          />
        </div>
      )}
      <FieldError msg={error} />
    </div>
  );
}
