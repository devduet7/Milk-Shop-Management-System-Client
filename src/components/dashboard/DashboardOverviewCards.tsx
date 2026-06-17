// <== IMPORTS ==>
import {
  Wallet,
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "@/types/dashboard-types";

// <== OVERVIEW CARD DEFINITION ==>
type OverviewCard = {
  // <== LABEL ==>
  label: string;
  // <== VALUE ==>
  value: string;
  // <== SUBVALUE ==>
  subValue?: string;
  // <== ICON ==>
  icon: typeof TrendingUp;
  // <== ICON CLASS ==>
  iconClass: string;
  // <== TOP BAR COLOR CLASS ==>
  topBar: string;
};

// <== DASHBOARD OVERVIEW CARDS PROPS ==>
interface DashboardOverviewCardsProps {
  // <== DASHBOARD SUMMARY ==>
  summary: DashboardSummary | undefined;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== DASHBOARD OVERVIEW CARDS COMPONENT ==>
const DashboardOverviewCards = memo(
  ({ summary, isLoading }: DashboardOverviewCardsProps) => {
    // NET POSITION IS POSITIVE IF >= 0
    const netPositive = (summary?.overview?.netPosition ?? 0) >= 0;
    // BUILD OVERVIEW CARDS
    const cards: OverviewCard[] = [
      // TOTAL REVENUE
      {
        label: "Total Revenue",
        value: `₨${(summary?.overview?.totalRevenue ?? 0).toLocaleString()}`,
        subValue: "Sales + Quick Sales",
        icon: TrendingUp,
        iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        topBar: "bg-emerald-500",
      },
      // TOTAL EXPENSES
      {
        label: "Total Expenses",
        value: `₨${(summary?.overview?.totalExpenses ?? 0).toLocaleString()}`,
        subValue: "Purchases + Expenses + Staff",
        icon: Wallet,
        iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
        topBar: "bg-red-500",
      },
      // NET POSITION
      {
        label: "Net Position",
        value: `${netPositive ? "+" : ""}₨${(summary?.overview?.netPosition ?? 0).toLocaleString()}`,
        subValue: netPositive ? "Profitable month" : "Loss this month",
        icon: netPositive ? TrendingUp : TrendingDown,
        iconClass: netPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
        topBar: netPositive ? "bg-emerald-500" : "bg-red-500",
      },
      // OUTSTANDING
      {
        label: "Outstanding",
        value: `₨${(summary?.recovery?.totalOutstanding ?? 0).toLocaleString()}`,
        subValue: `${(summary?.recovery?.recoveryRate ?? 0).toFixed(1)}% recovery rate`,
        icon: RefreshCw,
        iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        topBar: "bg-amber-500",
      },
      // GROSS PROFIT
      {
        label: "Gross Profit",
        value: `₨${(summary?.overview?.grossProfit ?? 0).toLocaleString()}`,
        subValue: "Revenue minus purchase cost",
        icon: BarChart3,
        iconClass: "bg-primary/10 text-primary",
        topBar: "bg-primary",
      },
      // STAFF PAYROLL
      {
        label: "Staff Payroll",
        value: `₨${(summary?.staff?.totalMonthlyOutgo ?? 0).toLocaleString()}`,
        subValue: `${summary?.staff?.clearedCount ?? 0} / ${summary?.staff?.totalStaff ?? 0} cleared`,
        icon: Wallet,
        iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        topBar: "bg-purple-500",
      },
    ];
    // RETURNING OVERVIEW CARDS GRID — 2 COLS MOBILE, 3 COLS SM AND ABOVE
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
        {/* MAPPING OVERVIEW CARDS */}
        {cards.map((card, i) => {
          // ICON COMPONENT
          const Icon = card.icon;
          // RETURNING OVERVIEW CARD
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-3 sm:p-4 md:p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* COLORED TOP BAR — UNIQUE IDENTITY PER STAT */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-[3px] rounded-t-xl",
                  card.topBar,
                )}
              />
              {/* ICON */}
              <div
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3",
                  card.iconClass,
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              {/* LABEL */}
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">
                {card.label}
              </p>
              {/* VALUE OR SKELETON */}
              {isLoading ? (
                <Skeleton className="h-5 sm:h-6 md:h-7 w-16 sm:w-20 mt-1" />
              ) : (
                <>
                  <p className="text-base sm:text-xl md:text-2xl font-bold font-display mt-0.5 truncate">
                    {card.value}
                  </p>
                  {card.subValue && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                      {card.subValue}
                    </p>
                  )}
                </>
              )}
              {/* DECORATIVE CIRCLE */}
              <div className="absolute -bottom-4 -right-4 w-14 sm:w-18 md:w-20 h-14 sm:h-18 md:h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DashboardOverviewCards.displayName = "DashboardOverviewCards";

// <== EXPORT ==>
export default DashboardOverviewCards;
