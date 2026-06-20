// <== IMPORTS ==>
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
import {
  BarChart2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

// <== FINANCIAL SUMMARY KPI CARD PROPS ==>
interface KpiCardProps {
  // <== LABEL ==>
  label: string;
  // <== VALUE ==>
  value: string;
  // <== SUBTEXT ==>
  sub: string;
  // <== LUCIDE ICON ==>
  icon: LucideIcon;
  // <== ICON COLOR CLASS ==>
  iconClass: string;
  // <== TOP BAR COLOR CLASS ==>
  topBar: string;
  // <== OPTIONAL VALUE COLOR CLASS ==>
  valueClass?: string;
  // <== DELAY ==>
  delay: number;
}

// <== FINANCIAL SUMMARY KPI CARD ==>
const KpiCard = memo(
  ({
    label,
    value,
    sub,
    icon: Icon,
    iconClass,
    topBar,
    valueClass,
    delay,
  }: KpiCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="glass-card p-3 sm:p-4 relative overflow-hidden group hover:shadow-md transition-shadow"
    >
      {/* COLORED TOP BAR — UNIQUE IDENTITY PER CARD */}
      <div
        className={cn("absolute inset-x-0 top-0 h-[3px] rounded-t-xl", topBar)}
      />
      {/* ICON */}
      <div
        className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3",
          iconClass,
        )}
      >
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      {/* LABEL */}
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
        {label}
      </p>
      {/* VALUE */}
      <p
        className={cn(
          "text-base sm:text-lg md:text-xl font-bold font-display mt-0.5 truncate",
          valueClass,
        )}
      >
        {value}
      </p>
      {/* SUB */}
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      {/* DECORATIVE CIRCLE */}
      <div className="absolute -bottom-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
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
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-52 hidden sm:block" />
        </div>
      </div>
      {/* MONTH NAV PILL SKELETON */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-xl border border-border/50 px-1 py-1">
        <Skeleton className="h-7 w-7 rounded-lg" />
        <Skeleton className="h-4 w-28 mx-1" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
    </div>
    {/* KPI STRIP */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 sm:mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-3 sm:p-4 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-muted/60 rounded-t-xl" />
          <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-5 sm:h-6 w-24 mt-0.5" />
          <Skeleton className="h-3 w-16 mt-1" />
        </div>
      ))}
    </div>
    {/* CHART SKELETONS */}
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0" />
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
                <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0" />
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
  // IS GROSS PROFIT POSITIVE
  const grossPositive = (fs?.grossProfit ?? 0) >= 0;
  // SHOW FULL PAGE SKELETON ON INITIAL LOAD
  if (isLoading && !data) return <AnalyticsPageSkeleton />;
  // RETURNING ANALYTICS PAGE
  return (
    <PageTransition className="page-container">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* LEFT: ICON BADGE + TITLE + DESCRIPTION */}
        <div className="flex items-center gap-3 min-w-0">
          {/* PAGE ICON BADGE WITH GRADIENT */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <BarChart2 className="w-[18px] h-[18px] text-primary-foreground stroke-[2.5]" />
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
        {/* RIGHT: MONTH NAVIGATION PILL */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl border border-border/50 px-1 py-1 self-start sm:self-auto">
          {/* PREV MONTH BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {/* CURRENT MONTH LABEL */}
          <span className="text-sm font-semibold whitespace-nowrap min-w-[100px] text-center px-1">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
          {/* NEXT MONTH BUTTON */}
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
      {/* KPI STRIP — FOUR TOP-LEVEL FINANCIAL METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 sm:mb-6">
        {/* TOTAL REVENUE */}
        <KpiCard
          label="Total Revenue"
          value={`₨${(fs?.totalRevenue ?? 0).toLocaleString()}`}
          sub="Sales + Quick Sales"
          icon={TrendingUp}
          iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          topBar="bg-emerald-500"
          delay={0.05}
        />
        {/* TOTAL EXPENSES */}
        <KpiCard
          label="Total Expenses"
          value={`₨${(fs?.totalExpenses ?? 0).toLocaleString()}`}
          sub="Purchases + Exp + Staff"
          icon={TrendingDown}
          iconClass="bg-red-500/10 text-red-600 dark:text-red-400"
          topBar="bg-red-500"
          delay={0.08}
        />
        {/* NET POSITION — DYNAMIC COLOR BASED ON PROFITABILITY */}
        <KpiCard
          label="Net Position"
          value={`${netPositive ? "+" : ""}₨${(fs?.netPosition ?? 0).toLocaleString()}`}
          sub={netPositive ? "Profitable month" : "Loss this month"}
          icon={netPositive ? TrendingUp : TrendingDown}
          iconClass={
            netPositive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }
          topBar={netPositive ? "bg-emerald-500" : "bg-red-500"}
          valueClass={
            netPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }
          delay={0.11}
        />
        {/* GROSS PROFIT — DYNAMIC COLOR BASED ON VALUE */}
        <KpiCard
          label="Gross Profit"
          value={`₨${(fs?.grossProfit ?? 0).toLocaleString()}`}
          sub="Revenue minus purchases"
          icon={DollarSign}
          iconClass={
            grossPositive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }
          topBar={grossPositive ? "bg-emerald-500" : "bg-amber-500"}
          valueClass={
            grossPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600 dark:text-amber-400"
          }
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

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default Analytics;
