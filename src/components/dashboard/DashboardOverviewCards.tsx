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
  // <== IS POSITIVE ==>
  isPositive?: boolean;
  // <== IS NEUTRAL ==>
  isNeutral?: boolean;
  // <== ICON ==>
  icon: typeof TrendingUp;
  // <== ICON CLASS ==>
  iconClass: string;
  // <== BADGE CLASS ==>
  badgeClass: string;
  // <== BADGE LABEL ==>
  badgeLabel: string;
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
    // NET POSITION IS POSITIVE IF > 0
    const netPositive = (summary?.overview?.netPosition ?? 0) >= 0;
    // BUILD OVERVIEW CARDS
    const cards: OverviewCard[] = [
      // TOTAL REVENUE
      {
        label: "Total Revenue",
        value: `₨${(summary?.overview?.totalRevenue ?? 0).toLocaleString()}`,
        subValue: `Sales + Quick Sales`,
        isPositive: true,
        icon: TrendingUp,
        iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        badgeLabel: "INCOME",
      },
      // TOTAL EXPENSES
      {
        label: "Total Expenses",
        value: `₨${(summary?.overview?.totalExpenses ?? 0).toLocaleString()}`,
        subValue: `Purchases + Expenses + Staff`,
        isPositive: false,
        icon: Wallet,
        iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
        badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400",
        badgeLabel: "OUTGO",
      },
      // NET POSITION
      {
        label: "Net Position",
        value: `${netPositive ? "+" : ""}₨${(summary?.overview?.netPosition ?? 0).toLocaleString()}`,
        subValue: netPositive ? "Profitable month" : "Loss this month",
        isPositive: netPositive,
        icon: netPositive ? TrendingUp : TrendingDown,
        iconClass: netPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
        badgeClass: netPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
        badgeLabel: netPositive ? "PROFIT" : "LOSS",
      },
      // OUTSTANDING
      {
        label: "Outstanding",
        value: `₨${(summary?.recovery?.totalOutstanding ?? 0).toLocaleString()}`,
        subValue: `${(summary?.recovery?.recoveryRate ?? 0).toFixed(1)}% recovery rate`,
        isNeutral: true,
        icon: RefreshCw,
        iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        badgeLabel: "DUE",
      },
      // GROSS PROFIT
      {
        label: "Gross Profit",
        value: `₨${(summary?.overview?.grossProfit ?? 0).toLocaleString()}`,
        subValue: `Revenue minus purchase cost`,
        isPositive: (summary?.overview?.grossProfit ?? 0) >= 0,
        icon: BarChart3,
        iconClass: "bg-primary/10 text-primary",
        badgeClass: "bg-primary/10 text-primary",
        badgeLabel: "GROSS",
      },
      // STAFF PAYROLL
      {
        label: "Staff Payroll",
        value: `₨${(summary?.staff?.totalMonthlyOutgo ?? 0).toLocaleString()}`,
        subValue: `${summary?.staff?.clearedCount ?? 0} / ${summary?.staff?.totalStaff ?? 0} cleared`,
        isNeutral: true,
        icon: Wallet,
        iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        badgeLabel: "PAYROLL",
      },
    ];
    // RETURNING OVERVIEW CARDS GRID
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-6">
        {/* MAPPING OVERVIEW CARDS */}
        {cards.map((card, i) => {
          // ICON FOR THE CARD
          const Icon = card.icon;
          // RETURNING OVERVIEW CARD
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-3 sm:p-4 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    card.iconClass,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div
                  className={cn(
                    "text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full",
                    card.badgeClass,
                  )}
                >
                  {card.badgeLabel}
                </div>
              </div>
              {/* LABEL */}
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                {card.label}
              </p>
              {/* VALUE */}
              {isLoading ? (
                <Skeleton className="h-5 w-20 mt-1" />
              ) : (
                <>
                  <p className="text-sm sm:text-base font-bold font-display mt-0.5 truncate">
                    {card.value}
                  </p>
                  {card.subValue && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                      {card.subValue}
                    </p>
                  )}
                </>
              )}
              {/* DECORATIVE CIRCLE */}
              <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
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
