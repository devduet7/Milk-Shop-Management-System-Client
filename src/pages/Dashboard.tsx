// <== IMPORTS ==>
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useState, useCallback } from "react";
import { useDashboardSummary } from "@/hooks/useDashboard";
import SalesSection from "@/components/dashboard/SalesSection";
import StaffSection from "@/components/dashboard/StaffSection";
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
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    {/* OVERVIEW CARDS SKELETON */}
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
          <Skeleton className="h-3 w-20 mb-1.5" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
    {/* SECTION SKELETONS */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-card overflow-hidden mb-4">
        <div className="p-4 sm:p-5 flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2 ml-auto">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// <== DASHBOARD PAGE COMPONENT ==>
const Dashboard = memo(() => {
  // SELECTED MONTH STATE — INITIALISED TO CURRENT MONTH
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // DERIVED MONTH STRING
  const monthStr = format(selectedMonth, "yyyy-MM");
  // IS NEXT MONTH DISABLED — BLOCK NAVIGATION INTO FUTURE MONTHS
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // FETCH DASHBOARD SUMMARY FOR THE SELECTED MONTH
  const { data: summary, isLoading } = useDashboardSummary(monthStr);
  // HANDLE PREV MONTH
  const handlePrevMonth = useCallback((): void => {
    // DECREMENT MONTH BY ONE
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1),
    );
  }, []);
  // HANDLE NEXT MONTH
  const handleNextMonth = useCallback((): void => {
    // INCREMENT MONTH BY ONE
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1),
    );
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
        {/* LEFT: ICON + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Month-by-month overview of your dairy business
            </p>
          </div>
        </div>
        {/* RIGHT: MONTH NAVIGATION */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium whitespace-nowrap min-w-[100px] text-center">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isNextMonthDisabled}
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
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
            month={monthStr}
            isLoading={isLoading}
          />
        </motion.div>
        {/* QUICK SALES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <QuickSalesSection stats={summary?.quickSales} month={monthStr} />
        </motion.div>
        {/* PURCHASES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PurchasesSection stats={summary?.purchases} month={monthStr} />
        </motion.div>
        {/* EXPENDITURES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <ExpendituresSection stats={summary?.expenditures} month={monthStr} />
        </motion.div>
        {/* CUSTOMER DELIVERIES SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DeliverySection stats={summary?.deliveries} month={monthStr} />
        </motion.div>
        {/* STAFF PAYROLL SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <StaffSection stats={summary?.staff} month={monthStr} />
        </motion.div>
        {/* RECOVERY SECTION — ALL-TIME, STATS ONLY, LINKS TO RECOVERIES PAGE */}
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
