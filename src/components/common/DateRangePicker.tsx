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
  isWithinInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useRef, useState, useEffect, useCallback } from "react";
import { X, CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";

// <== DAY NAME HEADERS ==>
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

// <== DATE RANGE PICKER PROPS ==>
interface DateRangePickerProps {
  // <== CURRENTLY SELECTED RANGE START (YYYY-MM-DD | NULL) ==>
  startDate: string | null;
  // <== CURRENTLY SELECTED RANGE END (YYYY-MM-DD | NULL) ==>
  endDate: string | null;
  // <== RANGE SELECT CALLBACK — FIRES ONCE BOTH ENDS ARE CHOSEN ==>
  onRangeSelect: (start: string, end: string) => void;
  // <== CLEAR SELECTED RANGE CALLBACK ==>
  onClear: () => void;
}

// <== DATE RANGE PICKER COMPONENT ==>
const DateRangePicker = memo(
  ({ startDate, endDate, onRangeSelect, onClear }: DateRangePickerProps) => {
    // CALENDAR POPOVER OPEN STATE
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // VIEW DATE STATE — THE MONTH CURRENTLY DISPLAYED IN THE PICKER
    const [viewDate, setViewDate] = useState<Date>(() =>
      startDate ? parseISO(startDate) : new Date(),
    );
    // DRAFT START DATE DURING SELECTION (SET BY THE FIRST CLICK, BEFORE THE RANGE IS COMPLETE)
    const [draftStart, setDraftStart] = useState<string | null>(startDate);
    // CONTAINER REF FOR CLICK OUTSIDE DETECTION
    const containerRef = useRef<HTMLDivElement>(null);
    // SYNC DRAFT START WITH THE COMMITTED PROP WHENEVER THE CALENDAR IS CLOSED
    useEffect(() => {
      // ONLY SYNC WHEN CLOSED — AVOID CLOBBERING AN IN-PROGRESS SELECTION WHILE OPEN
      if (!isOpen) setDraftStart(startDate);
    }, [startDate, isOpen]);
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
    // HANDLE DAY CLICK — FIRST CLICK STARTS THE RANGE, SECOND CLICK COMPLETES IT
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
        // FORMAT CLICKED DATE AS YYYY-MM-DD
        const formatted = format(clicked, "yyyy-MM-dd");
        // FIRST CLICK, OR RESTARTING AFTER A PREVIOUSLY COMPLETED RANGE — SET DRAFT START ONLY
        if (!draftStart || (startDate && endDate)) {
          // STARTING A FRESH SELECTION
          setDraftStart(formatted);
          // WAITING FOR THE SECOND CLICK TO COMPLETE THE RANGE
          return;
        }
        // SECOND CLICK — COMPLETE THE RANGE, SWAPPING IF THE USER PICKED BACKWARDS
        const finalStart = formatted < draftStart ? formatted : draftStart;
        // RESOLVING THE FINAL END DATE
        const finalEnd = formatted < draftStart ? draftStart : formatted;
        // FIRING THE CALLBACK WITH THE COMPLETED RANGE
        onRangeSelect(finalStart, finalEnd);
        // CLOSING THE CALENDAR — SELECTION IS COMPLETE
        setIsOpen(false);
      },
      [viewDate, draftStart, startDate, endDate, onRangeSelect],
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
    // PARSED COMMITTED RANGE BOUNDARIES FOR HIGHLIGHTING
    const committedStartObj = startDate ? parseISO(startDate) : null;
    // PARSED COMMITTED END FOR HIGHLIGHTING
    const committedEndObj = endDate ? parseISO(endDate) : null;
    // PARSED DRAFT START FOR HIGHLIGHTING THE IN-PROGRESS SELECTION
    const draftStartObj = draftStart ? parseISO(draftStart) : null;
    // RETURNING DATE RANGE PICKER
    return (
      // CONTAINER
      <div ref={containerRef} className="relative">
        {/* TRIGGER BUTTON */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
            startDate && endDate
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
          )}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>
            {startDate && endDate
              ? `${format(parseISO(startDate), "dd MMM")} – ${format(parseISO(endDate), "dd MMM")}`
              : "Date Range"}
          </span>
          {/* CLEAR BUTTON */}
          {startDate && endDate && (
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
              {/* SELECTION HINT */}
              <p className="text-[11px] text-muted-foreground text-center mb-2">
                {!draftStart || (startDate && endDate)
                  ? "Select a start date"
                  : "Now select an end date"}
              </p>
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
                  // IS THIS DAY THE DRAFT START (IN-PROGRESS SELECTION ANCHOR)
                  const isDraftStart =
                    draftStartObj !== null && isSameDay(dayDate, draftStartObj);
                  // IS THIS DAY EITHER COMMITTED ENDPOINT
                  const isCommittedEndpoint =
                    (committedStartObj !== null &&
                      isSameDay(dayDate, committedStartObj)) ||
                    (committedEndObj !== null &&
                      isSameDay(dayDate, committedEndObj));
                  // IS THIS DAY WITHIN THE COMMITTED RANGE
                  const isInRange =
                    committedStartObj !== null &&
                    committedEndObj !== null &&
                    isWithinInterval(dayDate, {
                      start: committedStartObj,
                      end: committedEndObj,
                    });
                  // RETURNING DAY BUTTON
                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      disabled={isFutureDay}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "h-8 w-full flex items-center justify-center rounded-md text-xs font-medium transition-all",
                        (isCommittedEndpoint || isDraftStart) &&
                          "bg-primary text-primary-foreground shadow-sm",
                        isInRange &&
                          !isCommittedEndpoint &&
                          "bg-primary/15 text-primary",
                        !isCommittedEndpoint &&
                          !isDraftStart &&
                          !isInRange &&
                          isDayToday &&
                          "border border-primary text-primary",
                        !isCommittedEndpoint &&
                          !isDraftStart &&
                          !isInRange &&
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DateRangePicker.displayName = "DateRangePicker";

// <== EXPORT ==>
export default DateRangePicker;
