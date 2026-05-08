// <== IMPORTS ==>
import { BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useState, useCallback } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PageTransition } from "@/components/layout/PageTransition";
import StaffPayrollChart from "@/components/analytics/StaffPayrollChart";
import SalesBreakdownChart from "@/components/analytics/SalesBreakdownChart";
import PurchasesTrendChart from "@/components/analytics/PurchasesTrendChart";
import QuickSalesDailyChart from "@/components/analytics/QuickSalesDailyChart";
import RecoverySummaryChart from "@/components/analytics/RecoverySummaryChart";
import RevenueVsExpensesChart from "@/components/analytics/RevenueVsExpensesChart";
import ExpendituresDonutChart from "@/components/analytics/ExpendituresDonutChart";
import DeliveryPerformanceChart from "@/components/analytics/DeliveryPerformanceChart";

// <== FINANCIAL SUMMARY KPI CARD PROPS ==>
interface KpiCardProps {
  // <== LABEL ==>
  label: string;
  // <== VALUE ==>
  value: string;
  // <== SUBTEXT ==>
  sub: string;
  // <== IS POSITIVE ==>
  isPositive?: boolean;
  // <== IS NEUTRAL ==>
  isNeutral?: boolean;
  // <== DELAY ==>
  delay: number;
}

// <== FINANCIAL SUMMARY KPI CARD ==>
const KpiCard = memo(
  ({ label, value, sub, isPositive, isNeutral, delay }: KpiCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className={cn(
        "glass-card p-3 sm:p-4 text-center",
        !isNeutral && isPositive !== undefined && "border-l-2",
        !isNeutral &&
          isPositive !== undefined &&
          (isPositive ? "border-l-emerald-500" : "border-l-red-500"),
      )}
    >
      <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-sm sm:text-base font-bold font-display mt-0.5",
          !isNeutral &&
            isPositive !== undefined &&
            (isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"),
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
    </motion.div>
  ),
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
KpiCard.displayName = "KpiCard";

// <== ANALYTICS PAGE SKELETON ==>
const AnalyticsPageSkeleton = () => (
  <div className="page-container">
    {/* HEADER */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
    {/* KPI STRIP */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-3 sm:p-4 text-center space-y-1.5">
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-5 w-24 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      ))}
    </div>
    {/* CHART SKELETONS */}
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="w-full h-[280px] rounded-xl" />
      </div>
      {[0, 1].map((row) => (
        <div key={row} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1].map((col) => (
            <div key={col} className="glass-card p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="w-full h-[240px] rounded-xl" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// <== ANALYTICS PAGE COMPONENT ==>
const Analytics = memo(() => {
  // SELECTED MONTH STATE — INITIALISED TO CURRENT MONTH
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // DERIVED MONTH STRING FOR API QUERY
  const monthStr = format(selectedMonth, "yyyy-MM");
  // IS NEXT MONTH NAVIGATION DISABLED — BLOCK FUTURE MONTHS
  const isNextMonthDisabled =
    selectedMonth.getMonth() >= new Date().getMonth() &&
    selectedMonth.getFullYear() >= new Date().getFullYear();
  // FETCH ALL ANALYTICS CHART DATA FOR THE SELECTED MONTH
  const { data, isLoading } = useAnalytics(monthStr);
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
  // FINANCIAL SUMMARY ALIAS FOR CONVENIENCE
  const fs = data?.financialSummary;
  // IS NET POSITION POSITIVE
  const netPositive = (fs?.netPosition ?? 0) >= 0;
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (isLoading && !data) return <AnalyticsPageSkeleton />;
  // RETURNING ANALYTICS PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              Analytics
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Visual performance report for {format(selectedMonth, "MMMM yyyy")}
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
      {/* KPI STRIP — FOUR TOP-LEVEL FINANCIAL METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Total Revenue"
          value={`₨${(fs?.totalRevenue ?? 0).toLocaleString()}`}
          sub={`Sales + Quick Sales`}
          isPositive={true}
          delay={0.05}
        />
        <KpiCard
          label="Total Expenses"
          value={`₨${(fs?.totalExpenses ?? 0).toLocaleString()}`}
          sub={`Purchases + Exp + Staff`}
          isPositive={false}
          delay={0.08}
        />
        <KpiCard
          label="Net Position"
          value={`${netPositive ? "+" : ""}₨${(fs?.netPosition ?? 0).toLocaleString()}`}
          sub={netPositive ? "Profitable month" : "Loss this month"}
          isPositive={netPositive}
          delay={0.11}
        />
        <KpiCard
          label="Gross Profit"
          value={`₨${(fs?.grossProfit ?? 0).toLocaleString()}`}
          sub={`Revenue minus purchases`}
          isPositive={(fs?.grossProfit ?? 0) >= 0}
          delay={0.14}
        />
      </div>
      {/* CHART LAYOUT */}
      <div className="space-y-4 sm:space-y-5">
        {/* ROW 1: REVENUE VS EXPENSES — FULL WIDTH, MOST IMPORTANT CHART */}
        <RevenueVsExpensesChart
          data={data?.dailyFinancials ?? []}
          summary={fs}
          isLoading={isLoading}
        />
        {/* ROW 2: SALES BREAKDOWN + EXPENDITURES DONUT */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
          {/* SALES BREAKDOWN — WIDER */}
          <div className="lg:col-span-3">
            <SalesBreakdownChart
              data={data?.salesBreakdown}
              isLoading={isLoading}
            />
          </div>
          {/* EXPENDITURES DONUT — NARROWER */}
          <div className="lg:col-span-2">
            <ExpendituresDonutChart
              data={data?.expendituresByCategory ?? []}
              isLoading={isLoading}
            />
          </div>
        </div>
        {/* ROW 3: QUICK SALES DAILY + PURCHASES TREND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <QuickSalesDailyChart
            dailyData={data?.dailyQuickSales ?? []}
            breakdown={data?.quickSalesBreakdown}
            isLoading={isLoading}
          />
          <PurchasesTrendChart
            data={data?.dailyPurchases ?? []}
            totalSpent={fs?.totalPurchaseCost ?? 0}
            isLoading={isLoading}
          />
        </div>
        {/* ROW 4: DELIVERY PERFORMANCE — FULL WIDTH */}
        <DeliveryPerformanceChart
          data={data?.dailyDeliveries ?? []}
          isLoading={isLoading}
        />
        {/* ROW 5: STAFF PAYROLL + RECOVERY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <StaffPayrollChart
            data={data?.staffPayroll ?? []}
            totalOutgo={fs?.totalStaffOutgo ?? 0}
            isLoading={isLoading}
          />
          <RecoverySummaryChart data={data?.recovery} isLoading={isLoading} />
        </div>
      </div>
    </PageTransition>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
Analytics.displayName = "Analytics";

// <== MEMOIZED EXPORT ==>
export default Analytics;
