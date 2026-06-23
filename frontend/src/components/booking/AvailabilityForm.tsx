import { useState, useEffect } from "react";
import { type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/common/FieldError";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, ChevronDown } from "lucide-react";

export type AvailabilityValues = {
  date: string;
  startTime: string;
  endTime: string;
  eventType: string;
};

type Props = {
  formik: FormikProps<AvailabilityValues>;
  photographerFirstName: string;
  availabilityError: string;
  today: string;
  allowedEventTypes?: string[];
  allowCustomEventTypes?: boolean;
};

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30", "23:00"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function AvailabilityForm({
  formik,
  photographerFirstName,
  availabilityError,
  today,
  allowedEventTypes = [],
  allowCustomEventTypes = true,
}: Props) {
  // Dropdown visibility states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTimes, setShowStartTimes] = useState(false);
  const [showEndTimes, setShowEndTimes] = useState(false);
  const [showEventTypes, setShowEventTypes] = useState(false);

  // Custom Event Type fields
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customEventValue, setCustomEventValue] = useState("");

  // Calendar navigation states
  const [navDate, setNavDate] = useState(() => {
    const initial = formik.values.date ? new Date(formik.values.date) : new Date();
    return isNaN(initial.getTime()) ? new Date() : initial;
  });

  // Keep Event Type select option aligned when "Other" is toggled
  useEffect(() => {
    if (formik.values.eventType && allowedEventTypes.length > 0) {
      const isPredefined = allowedEventTypes.includes(formik.values.eventType);
      if (!isPredefined && formik.values.eventType !== "") {
        setIsOtherSelected(true);
        setCustomEventValue(formik.values.eventType);
      } else {
        setIsOtherSelected(false);
      }
    }
  }, [formik.values.eventType, allowedEventTypes]);

  // Format date display label: "Select a date" or "YYYY-MM-DD" -> "Month DD, YYYY"
  const getDateLabel = () => {
    if (!formik.values.date) return "Select preferred date";
    const dateObj = new Date(formik.values.date);
    if (isNaN(dateObj.getTime())) return formik.values.date;
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format 24h clock to AM/PM label: "14:30" -> "2:30 PM"
  const formatTimeLabel = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hrs = parseInt(h, 10);
    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayHrs}:${m} ${ampm}`;
  };

  // Calendar builder math
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const buildCalendarGrid = () => {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const cells: (Date | null)[] = [];

    // Fill offset days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    // Fill days of the current month
    for (let day = 1; day <= totalDays; day++) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  };

  const handlePrevMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(navDate.getFullYear(), navDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    // Format YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${d}`;
    formik.setFieldValue("date", formatted);
    setShowCalendar(false);
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const checkDate = new Date(date);
    checkDate.setHours(23, 59, 59, 999); // Safe offset comparison
    const limitDate = new Date(today);
    limitDate.setHours(0, 0, 0, 0);
    return checkDate < limitDate;
  };

  const handleSelectEventType = (val: string) => {
    if (val === "OTHER_OPTION") {
      setIsOtherSelected(true);
      formik.setFieldValue("eventType", "");
    } else {
      setIsOtherSelected(false);
      formik.setFieldValue("eventType", val);
    }
    setShowEventTypes(false);
  };

  const handleCustomEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomEventValue(val);
    formik.setFieldValue("eventType", val);
  };

  const calendarGrid = buildCalendarGrid();

  return (
    <Card className="border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm bg-white dark:bg-zinc-900 rounded-xl overflow-visible">
      <CardHeader>
        <CardTitle className="text-title-medium text-primary-dark dark:text-white">Check Availability</CardTitle>
        <CardDescription className="text-body-small text-zinc-500 mt-1">
          Pick your preferred date and time to see if {photographerFirstName} is free.
        </CardDescription>
      </CardHeader>

      <form onSubmit={formik.handleSubmit} className="relative">
        <CardContent className="space-y-5">
          {availabilityError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-650 dark:text-red-400 border border-red-250/20">
              {availabilityError}
            </div>
          )}

          {/* Date Picker Button & Popover */}
          <div className="space-y-2 relative">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Date
            </Label>
            <div className="relative">
              <Button
                type="button"
                onClick={() => {
                  setShowCalendar(!showCalendar);
                  setShowStartTimes(false);
                  setShowEndTimes(false);
                  setShowEventTypes(false);
                }}
                className="w-full h-[50px] justify-start text-left font-normal bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center gap-2.5 shadow-sm"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 shrink-0" />
                {getDateLabel()}
              </Button>
            </div>

            {/* Custom Popover Backdrop */}
            {showCalendar && (
              <>
                <div
                  className="fixed inset-0 z-30 bg-transparent"
                  onClick={() => setShowCalendar(false)}
                />
                <div className="absolute top-[85px] left-0 z-40 w-full sm:w-[320px] rounded-xl border border-zinc-200/60 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                      {MONTHS[navDate.getMonth()]} {navDate.getFullYear()}
                    </h4>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="h-7 w-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Day headings */}
                  <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-zinc-450 uppercase mb-2">
                    {DAYS_OF_WEEK.map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map((date, idx) => {
                      if (!date) {
                        return <div key={`empty-${idx}`} />;
                      }
                      const isDisabled = isDateDisabled(date);
                      const isSelected = formik.values.date === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleDateSelect(date)}
                          className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold"
                              : isDisabled
                              ? "text-zinc-300 dark:text-zinc-700 pointer-events-none cursor-not-allowed"
                              : "text-zinc-700 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
            <FieldError msg={formik.touched.date ? formik.errors.date : undefined} />
          </div>

          {/* Time Picker Inputs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time Dropdown */}
            <div className="space-y-2 relative">
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                Start Time
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  onClick={() => {
                    setShowStartTimes(!showStartTimes);
                    setShowCalendar(false);
                    setShowEndTimes(false);
                    setShowEventTypes(false);
                  }}
                  className="w-full h-[50px] justify-between bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                    {formik.values.startTime ? formatTimeLabel(formik.values.startTime) : "Select start"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
                </Button>
              </div>

              {showStartTimes && (
                <>
                  <div
                    className="fixed inset-0 z-35 bg-transparent"
                    onClick={() => setShowStartTimes(false)}
                  />
                  <div className="absolute top-[85px] left-0 z-40 w-full max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200/60 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={`start-${slot}`}
                        type="button"
                        onClick={() => {
                          formik.setFieldValue("startTime", slot);
                          setShowStartTimes(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                          formik.values.startTime === slot ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""
                        }`}
                      >
                        {formatTimeLabel(slot)}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <FieldError msg={formik.touched.startTime ? formik.errors.startTime : undefined} />
            </div>

            {/* End Time Dropdown */}
            <div className="space-y-2 relative">
              <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
                End Time
              </Label>
              <div className="relative">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEndTimes(!showEndTimes);
                    setShowCalendar(false);
                    setShowStartTimes(false);
                    setShowEventTypes(false);
                  }}
                  className="w-full h-[50px] justify-between bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                    {formik.values.endTime ? formatTimeLabel(formik.values.endTime) : "Select end"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
                </Button>
              </div>

              {showEndTimes && (
                <>
                  <div
                    className="fixed inset-0 z-35 bg-transparent"
                    onClick={() => setShowEndTimes(false)}
                  />
                  <div className="absolute top-[85px] left-0 z-40 w-full max-h-[220px] overflow-y-auto rounded-xl border border-zinc-200/60 bg-white py-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
                    {TIME_SLOTS.map((slot) => {
                      const isDisabled = !!(formik.values.startTime && slot <= formik.values.startTime);
                      return (
                        <button
                          key={`end-${slot}`}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            formik.setFieldValue("endTime", slot);
                            setShowEndTimes(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                            isDisabled
                              ? "text-zinc-300 dark:text-zinc-700 pointer-events-none cursor-not-allowed bg-zinc-50/30 dark:bg-zinc-950/20"
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          } ${formik.values.endTime === slot ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""}`}
                        >
                          {formatTimeLabel(slot)}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              <FieldError msg={formik.touched.endTime ? formik.errors.endTime : undefined} />
            </div>
          </div>

          {/* Event Type selector */}
          <div className="space-y-2 relative">
            <Label className="text-body-small-s font-semibold text-zinc-700 dark:text-zinc-300">
              Event Type
            </Label>
            {allowedEventTypes.length > 0 ? (
              // Structured Select Dropdown
              <div className="space-y-2 relative">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEventTypes(!showEventTypes);
                    setShowCalendar(false);
                    setShowStartTimes(false);
                    setShowEndTimes(false);
                  }}
                  className="w-full h-[50px] justify-between bg-white hover:bg-zinc-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 px-4 flex items-center shadow-sm"
                >
                  <span>
                    {isOtherSelected
                      ? "Other (Specify Custom Type)"
                      : formik.values.eventType
                      ? formik.values.eventType
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
                          key={`type-${type}`}
                          type="button"
                          onClick={() => handleSelectEventType(type)}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                            !isOtherSelected && formik.values.eventType === type ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                      {allowCustomEventTypes && (
                        <button
                          type="button"
                          onClick={() => handleSelectEventType("OTHER_OPTION")}
                          className={`w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-t border-zinc-100 dark:border-zinc-800 text-zinc-500 font-medium ${
                            isOtherSelected ? "bg-zinc-50 dark:bg-zinc-950 font-bold" : ""
                          }`}
                        >
                          Other (Specify Custom Type)
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Display custom type entry input when "Other" option is active */}
                {isOtherSelected && (
                  <div className="pt-1.5 animate-in slide-in-from-top-1.5 duration-200">
                    <Input
                      id="customEventTypeInput"
                      placeholder="Specify your custom event type here..."
                      value={customEventValue}
                      onChange={handleCustomEventChange}
                      className="h-[50px] rounded-xl border-zinc-200 dark:border-zinc-850 dark:bg-zinc-950 text-sm focus:ring-primary-dark"
                    />
                  </div>
                )}
              </div>
            ) : (
              // Fallback to text input if no allowedEventTypes are defined
              <Input
                id="eventType"
                placeholder="e.g. Wedding, Portrait, Corporate Event"
                {...formik.getFieldProps("eventType")}
                className={`h-[50px] rounded-xl border-zinc-200 focus:ring-primary-dark focus:border-primary-dark dark:border-zinc-800 dark:bg-zinc-950 ${
                  formik.touched.eventType && formik.errors.eventType ? "border-red-500" : ""
                }`}
              />
            )}
            <FieldError msg={formik.touched.eventType ? formik.errors.eventType : undefined} />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="btn btn-primary w-full h-[50px] py-0 min-w-0 max-w-none md:max-w-none shadow-sm"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Checking..." : "Check Availability"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
