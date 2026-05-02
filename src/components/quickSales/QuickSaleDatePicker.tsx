// <== IMPORTS ==>
import {
  format,
  getDay,
  isToday,
  isFuture,
  parseISO,
  isSameDay,
  startOfMonth,
  getDaysInMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useRef, useState, useEffect, useCallback } from "react";

// <== DAY NAME HEADERS ==>
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

// <== QUICK SALE DATE PICKER PROPS ==>
interface QuickSaleDatePickerProps {
  // <== CURRENTLY SELECTED DATE (YYYY-MM-DD | NULL) ==>
  selectedDate: string | null;
  // <== DATE SELECT CALLBACK ==>
  onDateSelect: (date: string) => void;
  // <== CLEAR SELECTED DATE CALLBACK ==>
  onClear: () => void;
}

// <== QUICK SALE DATE PICKER COMPONENT ==>
const QuickSaleDatePicker = memo(
  ({ selectedDate, onDateSelect, onClear }: QuickSaleDatePickerProps) => {
    // CALENDAR POPOVER OPEN STATE
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // VIEW DATE STATE — THE MONTH CURRENTLY DISPLAYED IN THE PICKER (INDEPENDENT OF SELECTION)
    const [viewDate, setViewDate] = useState<Date>(() =>
      selectedDate ? parseISO(selectedDate) : new Date(),
    );
    // CONTAINER REF FOR CLICK OUTSIDE DETECTION
    const containerRef = useRef<HTMLDivElement>(null);
    // CLOSE CALENDAR ON CLICK OUTSIDE
    useEffect(() => {
      // CLICK OUTSIDE HANDLER
      const handleClickOutside = (e: MouseEvent): void => {
        // IF CLICK OUTSIDE CONTAINER — CLOSE
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          // CLOSE CALENDAR
          setIsOpen(false);
        }
      };
      // ONLY ATTACH LISTENER WHEN OPEN
      if (isOpen) document.addEventListener("mousedown", handleClickOut);
      // CLEANUP LISTENER ON UNMOUNT OR CLOSE
      return () => document.removeEventListener("mousedown", handleClickOut);
      // DEFINE HANDLER OUTSIDE TO MATCH IDENTITY
      function handleClickOut(e: MouseEvent) {
        // CALL THE OUTSIDE CLICK HANDLER
        handleClickOutside(e);
      }
    }, [isOpen]);
    // BUILD CALENDAR GRID DAYS FOR THE CURRENT VIEW MONTH
    const calendarDays = (() => {
      // FIRST DAY OF THE VIEW MONTH
      const firstDay = startOfMonth(viewDate);
      // DAY OF WEEK INDEX FOR THE FIRST DAY (0 = SUNDAY)
      const startDayIndex = getDay(firstDay);
      // TOTAL DAYS IN THE VIEW MONTH
      const daysInMonth = getDaysInMonth(viewDate);
      // BUILD ARRAY — LEADING NULL SLOTS FOR OFFSET + ACTUAL DAY NUMBERS
      const days: (number | null)[] = [
        ...Array(startDayIndex).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
      ];
      // RETURN ARRAY
      return days;
    })();
    // HANDLE DAY CLICK
    const handleDayClick = useCallback(
      (day: number): void => {
        // BUILD DATE OBJECT FOR THE CLICKED DAY IN VIEW MONTH
        const clicked = new Date(
          viewDate.getFullYear(),
          viewDate.getMonth(),
          day,
        );
        // BLOCK FUTURE DATES
        if (isFuture(clicked) && !isToday(clicked)) return;
        // FORMAT DATE AS YYYY-MM-DD
        const formatted = format(clicked, "yyyy-MM-dd");
        // FIRE CALLBACK
        onDateSelect(formatted);
        // CLOSE CALENDAR
        setIsOpen(false);
      },
      [viewDate, onDateSelect],
    );
    // NAVIGATE TO PREVIOUS MONTH
    const handlePrevMonth = useCallback((): void => {
      // NAVIGATE TO PREVIOUS MONTH BY SETTING VIEW DATE TO FIRST DAY OF PREVIOUS MONTH
      setViewDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
      );
    }, []);
    // NAVIGATE TO NEXT MONTH — BLOCKED FOR MONTHS AFTER CURRENT
    const handleNextMonth = useCallback((): void => {
      // GET FIRST DAY OF NEXT MONTH
      const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      // DON'T NAVIGATE PAST CURRENT MONTH
      const now = new Date();
      // CHECK IF NEXT MONTH IS IN THE FUTURE COMPARED TO CURRENT MONTH
      if (
        next.getFullYear() > now.getFullYear() ||
        (next.getFullYear() === now.getFullYear() &&
          next.getMonth() > now.getMonth())
      )
        // IF NEXT MONTH IS IN THE FUTURE — BLOCK NAVIGATION
        return;
      // OTHERWISE, SET VIEW DATE TO NEXT MONTH
      setViewDate(next);
    }, [viewDate]);
    // IS NEXT MONTH DISABLED
    const isNextDisabled = (() => {
      // GETTING CURRENT DATE FOR COMPARISON
      const now = new Date();
      // CHECK IF NEXT MONTH IS IN THE FUTURE COMPARED TO CURRENT MONTH
      return (
        viewDate.getFullYear() > now.getFullYear() ||
        (viewDate.getFullYear() === now.getFullYear() &&
          viewDate.getMonth() >= now.getMonth())
      );
    })();
    // PARSED SELECTED DATE OBJECT FOR COMPARISON
    const selectedDateObj = selectedDate ? parseISO(selectedDate) : null;
    // RETURNING DATE PICKER
    return (
      // CONTAINER
      <div ref={containerRef} className="relative">
        {/* TRIGGER BUTTON */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            selectedDate
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
          )}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {selectedDate
              ? format(parseISO(selectedDate), "dd MMM yyyy")
              : "Pick Date"}
          </span>
          {/* CLEAR BUTTON */}
          {selectedDate && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onClear();
                }
              }}
              className="ml-0.5 hover:opacity-70 transition-opacity"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
        {/* CALENDAR POPOVER */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 right-0 z-50 w-72 glass-card p-4 shadow-lg border border-border rounded-xl"
            >
              {/* MONTH NAVIGATION HEADER */}
              <div className="flex items-center justify-between mb-3">
                {/* PREV MONTH */}
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {/* MONTH LABEL */}
                <span className="text-sm font-semibold">
                  {format(viewDate, "MMMM yyyy")}
                </span>
                {/* NEXT MONTH */}
                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isNextDisabled}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {/* DAY NAME HEADERS */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-semibold text-muted-foreground py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {/* CALENDAR DAYS GRID */}
              <div className="grid grid-cols-7 gap-0.5">
                {calendarDays.map((day, idx) => {
                  // NULL SLOT — EMPTY SPACER FOR OFFSET
                  if (day === null)
                    return <div key={`empty-${idx}`} className="h-8" />;
                  // BUILD DATE OBJECT FOR THIS DAY
                  const dayDate = new Date(
                    viewDate.getFullYear(),
                    viewDate.getMonth(),
                    day,
                  );
                  // IS THIS DAY IN THE FUTURE
                  const isFutureDay = isFuture(dayDate) && !isToday(dayDate);
                  // IS THIS DAY TODAY
                  const isDayToday = isToday(dayDate);
                  // IS THIS DAY THE SELECTED DATE
                  const isSelected =
                    selectedDateObj !== null &&
                    isSameDay(dayDate, selectedDateObj);
                  // RETURNING DAY BUTTON
                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      disabled={isFutureDay}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "h-8 w-full flex items-center justify-center rounded-md text-xs font-medium transition-all",
                        isSelected &&
                          "bg-primary text-primary-foreground shadow-sm",
                        !isSelected &&
                          isDayToday &&
                          "border border-primary text-primary",
                        !isSelected &&
                          !isDayToday &&
                          !isFutureDay &&
                          "hover:bg-muted",
                        isFutureDay && "opacity-25 cursor-not-allowed",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {/* TODAY SHORTCUT */}
              <button
                type="button"
                onClick={() => {
                  const todayStr = format(new Date(), "yyyy-MM-dd");
                  onDateSelect(todayStr);
                  setIsOpen(false);
                }}
                className="mt-3 w-full text-xs text-primary font-medium hover:underline text-center"
              >
                Jump to Today
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
QuickSaleDatePicker.displayName = "QuickSaleDatePicker";

// <== EXPORT ==>
export default QuickSaleDatePicker;
