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
        iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        topBar: "bg-emerald-500",
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
        iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        topBar: "bg-blue-500",
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
        iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        topBar: "bg-purple-500",
      },
      // TOTAL TRANSACTIONS CARD
      {
        label: "Transactions",
        value: String(stats?.totalTransactions ?? 0),
        subValue: null,
        icon: ShoppingBag,
        iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        topBar: "bg-amber-500",
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
              className="glass-card relative overflow-hidden group hover:shadow-md transition-shadow p-3 sm:p-4 md:p-5"
            >
              {/* COLORED TOP BAR — UNIQUE IDENTITY PER STAT */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-[3px] rounded-t-xl",
                  stat.topBar,
                )}
              />
              {/* ICON */}
              <div
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3",
                  stat.iconClass,
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </div>
              {/* LABEL */}
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">
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
              <div className="absolute -bottom-4 -right-4 w-14 sm:w-18 md:w-20 h-14 sm:h-18 md:h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
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
