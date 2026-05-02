// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuickSaleStats } from "@/types/quick-sale-types";
import { TrendingUp, ShoppingBag, Milk, IceCream } from "lucide-react";

// <== QUICK SALE STATS CARDS PROPS ==>
interface QuickSaleStatsCardsProps {
  // <== STATS FROM API ==>
  stats: QuickSaleStats | undefined;
  // <== LOADING STATE ==>
  isLoading: boolean;
}

// <== QUICK SALE STATS CARDS COMPONENT ==>
const QuickSaleStatsCards = memo(
  ({ stats, isLoading }: QuickSaleStatsCardsProps) => {
    // BUILD STAT CARDS FROM STATS DATA
    const cards = [
      // TOTAL REVENUE CARD
      {
        label: "Total Revenue",
        value: `₨${(stats?.totalRevenue ?? 0).toLocaleString()}`,
        subValue: null,
        icon: TrendingUp,
        colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
      // MILK SOLD CARD
      {
        label: "Milk Sold",
        value: `${(stats?.totalMilkQty ?? 0).toLocaleString()}L`,
        subValue:
          (stats?.milkRevenue ?? 0) > 0
            ? `₨${(stats?.milkRevenue ?? 0).toLocaleString()} revenue`
            : null,
        icon: Milk,
        colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      },
      // YOGHURT SOLD CARD
      {
        label: "Yoghurt Sold",
        value: `${(stats?.totalYoghurtQty ?? 0).toLocaleString()}kg`,
        subValue:
          (stats?.yoghurtRevenue ?? 0) > 0
            ? `₨${(stats?.yoghurtRevenue ?? 0).toLocaleString()} revenue`
            : null,
        icon: IceCream,
        colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      },
      // TOTAL TRANSACTIONS CARD
      {
        label: "Transactions",
        value: String(stats?.totalTransactions ?? 0),
        subValue: null,
        icon: ShoppingBag,
        colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      },
    ];
    // RETURNING STATS GRID
    return (
      // STATS GRID — 2 COLS ON MOBILE, 4 COLS ON DESKTOP
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
        {/* MAPPING STATS CARDS */}
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
                <div
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center",
                    stat.iconClass,
                  )}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>
                {/* COLOR BADGE */}
                <div
                  className={cn(
                    "flex items-center text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full",
                    stat.colorClass,
                  )}
                >
                  <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
                <>
                  <p className="text-base sm:text-xl md:text-2xl font-bold font-display mt-0.5 truncate">
                    {stat.value}
                  </p>
                  {stat.subValue && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                      {stat.subValue}
                    </p>
                  )}
                </>
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
QuickSaleStatsCards.displayName = "QuickSaleStatsCards";

// <== EXPORT ==>
export default QuickSaleStatsCards;
