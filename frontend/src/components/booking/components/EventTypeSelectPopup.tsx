import React from "react";

type Props = {
  allowedEventTypes: string[];
  allowCustomEventTypes: boolean;
  value: string;
  isOtherSelected: boolean;
  onSelect: (val: string) => void;
  onClose: () => void;
};

export function EventTypeSelectPopup({
  allowedEventTypes,
  allowCustomEventTypes,
  value,
  isOtherSelected,
  onSelect,
  onClose,
}: Props) {
  return (
    <>
      <div className="fixed inset-0 z-35 bg-transparent" onClick={onClose} />
      <div className="absolute top-[55px] left-0 z-40 w-full max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200/60 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
        {allowedEventTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`w-full text-left px-4 py-2 text-body-caption hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
              !isOtherSelected && value === type
                ? "bg-zinc-50 dark:bg-zinc-950 font-bold"
                : ""
            }`}
          >
            {type}
          </button>
        ))}
        {allowCustomEventTypes && (
          <button
            type="button"
            onClick={() => onSelect("OTHER_OPTION")}
            className={`w-full text-left px-4 py-2 text-body-caption hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800 text-zinc-500 font-medium ${
              isOtherSelected ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""
            }`}
          >
            Other (Specify Custom Type)
          </button>
        )}
      </div>
    </>
  );
}
