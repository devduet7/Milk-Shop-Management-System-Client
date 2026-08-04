// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useState, useCallback } from "react";
import DatePicker from "@/components/common/DatePicker";
import { useDashboardSummary } from "@/hooks/useDashboard";
import SalesSection from "@/components/dashboard/SalesSection";
import StaffSection from "@/components/dashboard/StaffSection";
import DateRangePicker from "@/components/common/DateRangePicker";
import type { DashboardFilterType } from "@/types/dashboard-types";
import MilkLogSection from "@/components/dashboard/MilkLogSection";
import { PageTransition } from "@/components/layout/PageTransition";
import DeliverySection from "@/components/dashboard/DeliverySection";
import RecoverySection from "@/components/dashboard/RecoverySection";
import PurchasesSection from "@/components/dashboard/PurchasesSection";
import QuickSalesSection from "@/components/dashboard/QuickSalesSection";
import { ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import ExpendituresSection from "@/components/dashboard/ExpendituresSection";
import DashboardOverviewCards from "@/components/dashboard/DashboardOverviewCards";

// <== FULL PAGE SKELETON ==>
const DashboardPageSkeleton = () => (
  <div className="page-container">
    {/* HEADER SKELETON */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
      </div>
      {/* FILTER CONTROLS SKELETON — PILLS + PICKERS + MONTH NAV */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* FILTER TYPE PILLS SKELETON (TODAY / THIS WEEK) */}
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        {/* DATE PICKER SKELETON */}
        <Skeleton className="h-8 w-24 rounded-full" />
        {/* DATE RANGE PICKER SKELETON */}
        <Skeleton className="h-8 w-28 rounded-full" />
        {/* MONTH NAV SKELETON */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl border border-border/50 px-1 py-1">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-28 mx-1" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
      </div>
    </div>
    {/* OVERVIEW CARDS SKELETON — 2 COLS MOBILE, 3 COLS SM AND ABOVE */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-3 sm:p-4 md:p-5 overflow-hidden relative"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted/60 rounded-t-xl" />
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-5 sm:h-6 md:h-7 w-16 sm:w-20 mt-1" />
          <Skeleton className="h-3 w-16 mt-0.5 hidden sm:block" />
        </div>
      ))}
    </div>
    {/* SECTION SKELETONS */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-card overflow-hidden mb-4">
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2 ml-auto flex-wrap">
            <Skeleton className="h-7 w-14 rounded-lg" />
            <Skeleton className="h-7 w-14 rounded-lg" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// <== FILTER BUTTON TYPE ==>
type FilterButton = {
  // <== FILTER VALUE ==>
  value: DashboardFilterType;
  // <== DISPLAY LABEL ==>
  label: string;
};

// <== FILTER BUTTONS CONFIG ==>
const FILTER_BUTTONS: FilterButton[] = [
  // TODAY FILTER
  { value: "today", label: "Today" },
  // WEEK FILTER
  { value: "week", label: "This Week" },
];

// <== DASHBOARD PAGE COMPONENT ==>
const Dashboard = memo(() => {
  // ACTIVE FILTER TYPE STATE — DEFAULTS TO MONTH (MATCHES PRE-EXISTING BEHAVIOR)
  const [filterType, setFilterType] = useState<DashboardFilterType>("month");
  // SELECTED MONTH STATE — INITIALISED TO CURRENT MONTH. ALWAYS ACTIVE REGARDLESS OF FILTER TYPE
  // SINCE STAFF PAYROLL AND MONTHLY BILLING FIGURES STAY MONTH-SCOPED NO MATTER WHICH PILL IS ACTIVE
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // SELECTED SPECIFIC DATE FOR THE DATE PICKER FILTER (YYYY-MM-DD | NULL)
  const [specificDate, setSpecificDate] = useState<string | null>(null);
  // SELECTED RANGE START FOR THE DATE RANGE PICKER FILTER (YYYY-MM-DD | NULL)
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  // SELECTED RANGE END FOR THE DATE RANGE PICKER FILTER (YYYY-MM-DD | NULL)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  // DERIVED MONTH STRING
  const monthStr = format(selectedMonth, "yyyy-MM");
  // DERIVED DATE STRING FOR THE DATE FILTER
  const dateStr = specificDate ?? "";
  // DERIVED RANGE START STRING FOR THE RANGE FILTER
  const rangeStartStr = rangeStart ?? "";
  // DERIVED RANGE END STRING FOR THE RANGE FILTER
  const rangeEndStr = rangeEnd ?? "";
  // IS NEXT MONTH DISABLED — BLOCK NAVIGATION INTO FUTURE MONTHS
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // FETCH DASHBOARD SUMMARY FOR THE SELECTED FILTER
  const { data: summary, isLoading } = useDashboardSummary(
    filterType,
    monthStr,
    dateStr,
    rangeStartStr,
    rangeEndStr,
  );
  // HANDLE FILTER TYPE CHANGE
  const handleFilterChange = useCallback((type: DashboardFilterType): void => {
    // UPDATE FILTER TYPE
    setFilterType(type);
    // CLEARING THE DATE PICKER SELECTION
    setSpecificDate(null);
    // CLEARING THE DATE RANGE PICKER SELECTION
    setRangeStart(null);
    // CLEARING THE DATE RANGE PICKER END
    setRangeEnd(null);
  }, []);
  // HANDLE DATE PICKER SELECT — ACTIVATES THE DATE FILTER, CLEARS THE RANGE FILTER
  const handleDateSelect = useCallback((date: string): void => {
    // UPDATE SPECIFIC DATE
    setSpecificDate(date);
    // CLEARING THE DATE RANGE PICKER SELECTION
    setRangeStart(null);
    // CLEARING THE DATE RANGE PICKER END
    setRangeEnd(null);
    // SWITCH TO DATE FILTER
    setFilterType("date");
  }, []);
  // HANDLE DATE PICKER CLEAR — REVERT TO MONTH FILTER
  const handleDateClear = useCallback((): void => {
    // CLEAR SPECIFIC DATE
    setSpecificDate(null);
    // SWITCH BACK TO MONTH FILTER
    setFilterType("month");
  }, []);
  // HANDLE DATE RANGE PICKER SELECT — ACTIVATES THE RANGE FILTER, CLEARS THE DATE FILTER
  const handleRangeSelect = useCallback((start: string, end: string): void => {
    // UPDATE RANGE START
    setRangeStart(start);
    // UPDATE RANGE END
    setRangeEnd(end);
    // CLEARING THE DATE PICKER SELECTION
    setSpecificDate(null);
    // SWITCH TO RANGE FILTER
    setFilterType("range");
  }, []);
  // HANDLE DATE RANGE PICKER CLEAR — REVERT TO MONTH FILTER
  const handleRangeClear = useCallback((): void => {
    // CLEAR RANGE START
    setRangeStart(null);
    // CLEAR RANGE END
    setRangeEnd(null);
    // SWITCH BACK TO MONTH FILTER
    setFilterType("month");
  }, []);
  // HANDLE PREV MONTH
  const handlePrevMonth = useCallback((): void => {
    // DECREMENT MONTH BY ONE
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
    );
    // SELECTING A MONTH IMPLICITLY MEANS THE USER WANTS THE MONTH FILTER ACTIVE
    setFilterType("month");
  }, []);
  // HANDLE NEXT MONTH
  const handleNextMonth = useCallback((): void => {
    // INCREMENT MONTH BY ONE
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
    );
    // SELECTING A MONTH IMPLICITLY MEANS THE USER WANTS THE MONTH FILTER ACTIVE
    setFilterType("month");
  }, []);
  // SHOW PAGE SKELETON ON INITIAL LOAD
  if (isLoading && !summary) {
    // RETURNING DASHBOARD PAGE SKELETON
    return <DashboardPageSkeleton />;
  }
  // RETURNING DASHBOARD PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON BADGE + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON BADGE WITH GRADIENT */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <LayoutDashboard className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold leading-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Month-by-month overview of your dairy business
            </p>
          </div>
        </div>
        {/* RIGHT: FILTER CONTROLS */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          {/* FILTER TYPE PILLS */}
          {FILTER_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                filterType === value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground hover:border-border/80",
              )}
            >
              {label}
            </button>
          ))}
          {/* CUSTOM DATE PICKER */}
          <DatePicker
            selectedDate={specificDate}
            onDateSelect={handleDateSelect}
            onClear={handleDateClear}
          />
          {/* CUSTOM DATE RANGE PICKER */}
          <DateRangePicker
            startDate={rangeStart}
            endDate={rangeEnd}
            onRangeSelect={handleRangeSelect}
            onClear={handleRangeClear}
          />
          {/* MONTH NAVIGATION — ALWAYS VISIBLE; STAFF PAYROLL AND BILLING STAY SCOPED TO THIS MONTH
              REGARDLESS OF WHICH FILTER PILL ABOVE IS ACTIVE */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl border border-border/50 px-1 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold whitespace-nowrap min-w-[110px] text-center px-1">
              {format(selectedMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg"
              disabled={isNextMonthDisabled}
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* OVERVIEW CARDS — TOP-LEVEL FINANCIAL SUMMARY */}
      <DashboardOverviewCards summary={summary} isLoading={isLoading} />
      {/* MODULE SECTIONS — EACH COLLAPSIBLE WITH PAGINATED RECORDS */}
      <div className="space-y-4">
        {/* SALES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SalesSection
            customerSales={summary?.sales?.customerSales}
            shopSales={summary?.sales?.shopSales}
            filterType={filterType}
            month={monthStr}
            date={dateStr}
            rangeStart={rangeStartStr}
            rangeEnd={rangeEndStr}
            isLoading={isLoading}
          />
        </motion.div>
        {/* QUICK SALES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <QuickSalesSection
            stats={summary?.quickSales}
            filterType={filterType}
            month={monthStr}
            date={dateStr}
            rangeStart={rangeStartStr}
            rangeEnd={rangeEndStr}
          />
        </motion.div>
        {/* PURCHASES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PurchasesSection
            stats={summary?.purchases}
            filterType={filterType}
            month={monthStr}
            date={dateStr}
            rangeStart={rangeStartStr}
            rangeEnd={rangeEndStr}
          />
        </motion.div>
        {/* MILK LOG SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <MilkLogSection
            stats={summary?.milkLog}
            filterType={filterType}
            month={monthStr}
            date={dateStr}
            rangeStart={rangeStartStr}
            rangeEnd={rangeEndStr}
          />
        </motion.div>
        {/* EXPENDITURES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ExpendituresSection
            stats={summary?.expenditures}
            filterType={filterType}
            month={monthStr}
            date={dateStr}
            rangeStart={rangeStartStr}
            rangeEnd={rangeEndStr}
          />
        </motion.div>
        {/* CUSTOMER DELIVERIES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DeliverySection
            stats={summary?.deliveries}
            filterType={filterType}
            month={monthStr}
          />
        </motion.div>
        {/* STAFF PAYROLL SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <StaffSection stats={summary?.staff} month={monthStr} />
        </motion.div>
        {/* RECOVERY SECTION — ALL-TIME STATS, LINKS TO RECOVERIES PAGE */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RecoverySection stats={summary?.recovery} isLoading={isLoading} />
        </motion.div>
      </div>
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Dashboard.displayName = "Dashboard";

// <== EXPORT ==>
export default Dashboard;
