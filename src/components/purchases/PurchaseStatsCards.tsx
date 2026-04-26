// <== IMPORTS ==>
import {
  Milk,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { PurchaseStats } from "@/types/purchase-types";

// <== STAT CARD DEFINITION TYPE ==>
type StatCard = {
  // <== LABEL ==>
  label: string;
  // <== VALUE STRING ==>
  value: string;
  // <== LUCIDE ICON ==>
  icon: LucideIcon;
  // <== TREND DIRECTION ==>
  trend: "up" | "down";
  // <== TREND BADGE COLOR CLASS ==>
  colorClass: string;
};

// <== PURCHASE STATS CARDS PROPS ==>
interface PurchaseStatsCardsProps {
  // <== STATS DATA FROM API ==>
  stats: PurchaseStats | undefined;
  // <== LOADING STATE ==>
  isLoading: boolean;
}

// <== PURCHASE STATS CARDS COMPONENT ==>
const PurchaseStatsCards = memo(
  ({ stats, isLoading }: PurchaseStatsCardsProps) => {
    // BUILD STAT CARDS FROM STATS DATA
    const cards: StatCard[] = [
      // TOTAL SPENT
      {
        label: "Total Spent",
        value: `₨${(stats?.totalSpent ?? 0).toLocaleString()}`,
        icon: DollarSign,
        trend: "down",
        colorClass: "bg-red-500/10 text-red-600 dark:text-red-400",
      },
      // TOTAL MILK PURCHASED
      {
        label: "Milk Purchased",
        value: `${(stats?.totalMilk ?? 0).toLocaleString()}L`,
        icon: Milk,
        trend: "up",
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
      // TOTAL PURCHASES COUNT
      {
        label: "Total Purchases",
        value: (stats?.totalPurchases ?? 0).toString(),
        icon: Package,
        trend: "up",
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
      // AVERAGE COST PER LITER
      {
        label: "Avg Cost / Liter",
        value: `₨${(stats?.avgCostPerLiter ?? 0).toLocaleString()}`,
        icon: TrendingDown,
        trend: "down",
        colorClass: "bg-red-500/10 text-red-600 dark:text-red-400",
      },
    ];
    // RETURNING STATS GRID
    return (
      // STATS GRID — 1 COL ON MOBILE, 2 COLS ON SM, 4 COLS ON DESKTOP
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
        {cards.map((stat, i) => {
          // ICON COMPONENT
          const Icon = stat.icon;
          // RETURNING STAT CARD
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-3 sm:p-4 md:p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {/* CARD HEADER */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                {/* ICON WRAPPER */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
                {/* TREND BADGE */}
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full",
                    stat.colorClass,
                  )}
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                </div>
              </div>
              {/* LABEL */}
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                {stat.label}
              </p>
              {/* VALUE OR SKELETON */}
              {isLoading ? (
                <Skeleton className="h-5 sm:h-6 md:h-7 w-16 sm:w-20 mt-1" />
              ) : (
                <p className="text-base sm:text-xl md:text-2xl font-bold font-display mt-0.5 truncate">
                  {stat.value}
                </p>
              )}
              {/* DECORATIVE CIRCLE */}
              <div className="absolute -bottom-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            </motion.div>
          );
        })}
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
PurchaseStatsCards.displayName = "PurchaseStatsCards";

// <== EXPORT ==>
export default PurchaseStatsCards;
