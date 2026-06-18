// <== IMPORTS ==>
import {
  Milk,
  Package,
  DollarSign,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { SaleStats } from "@/types/sale-types";

// <== STAT CARD DEFINITION TYPE ==>
type StatCard = {
  // <== LABEL ==>
  label: string;
  // <== VALUE STRING ==>
  value: string;
  // <== LUCIDE ICON ==>
  icon: LucideIcon;
  // <== ICON COLOR CLASS ==>
  iconClass: string;
  // <== TOP BAR COLOR CLASS ==>
  topBar: string;
};

// <== SALE STATS CARDS PROPS ==>
interface SaleStatsCardsProps {
  // <== COMBINED STATS FROM API (COVERS ALL SALE TYPES FOR THE PERIOD) ==>
  stats: SaleStats | undefined;
  // <== LOADING STATE ==>
  isLoading: boolean;
}

// <== SALE STATS CARDS COMPONENT ==>
const SaleStatsCards = memo(({ stats, isLoading }: SaleStatsCardsProps) => {
  // BUILD STAT CARDS FROM COMBINED STATS DATA
  const cards: StatCard[] = [
    // TOTAL REVENUE (ALL SALES)
    {
      label: "Total Revenue",
      value: `₨${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      topBar: "bg-emerald-500",
    },
    // TOTAL MILK SOLD (LITERS — BOTH TYPES)
    {
      label: "Milk Sold",
      value: `${(stats?.totalMilkSold ?? 0).toLocaleString()}L`,
      icon: Milk,
      iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      topBar: "bg-blue-500",
    },
    // TOTAL YOGHURT SOLD (KG — BOTH TYPES)
    {
      label: "Yoghurt Sold",
      value: `${(stats?.totalYoghurtSold ?? 0).toLocaleString()}kg`,
      icon: Package,
      iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      topBar: "bg-amber-500",
    },
    // TOTAL PENDING BALANCE (CUSTOMER SALES ONLY — OUTSTANDING RECEIVABLES)
    {
      label: "Total Pending",
      value: `₨${(stats?.totalPending ?? 0).toLocaleString()}`,
      icon: TrendingDown,
      iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
      topBar: "bg-red-500",
    },
  ];
  // RETURNING STATS GRID
  return (
    // STATS GRID — 1 COL ON MOBILE, 2 COLS ON SM, 4 COLS ON DESKTOP
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 mb-5 sm:mb-6">
      {/* MAPPING STATS */}
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
            <div className="absolute -bottom-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
          </motion.div>
        );
      })}
    </div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
SaleStatsCards.displayName = "SaleStatsCards";

// <== EXPORT ==>
export default SaleStatsCards;
