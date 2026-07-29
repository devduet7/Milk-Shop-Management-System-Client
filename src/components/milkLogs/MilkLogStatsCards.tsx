// <== IMPORTS ==>
import {
  Milk,
  Percent,
  IceCream,
  ListOrdered,
  type LucideIcon,
} from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { MilkLogStats } from "@/types/milk-log-types";

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

// <== MILK LOG STATS CARDS PROPS ==>
interface MilkLogStatsCardsProps {
  // <== STATS DATA FROM API ==>
  stats: MilkLogStats | undefined;
  // <== LOADING STATE ==>
  isLoading: boolean;
}

// <== MILK LOG STATS CARDS COMPONENT ==>
const MilkLogStatsCards = memo(
  ({ stats, isLoading }: MilkLogStatsCardsProps) => {
    // BUILD STAT CARDS FROM STATS DATA
    const cards: StatCard[] = [
      // TOTAL LEFTOVER
      {
        label: "Leftover Carried Over",
        value: `${(stats?.totalLeftover ?? 0).toLocaleString()}L`,
        icon: Milk,
        iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        topBar: "bg-blue-500",
      },
      // TOTAL USED FOR YOGHURT
      {
        label: "Used for Yoghurt",
        value: `${(stats?.totalYoghurt ?? 0).toLocaleString()}L`,
        icon: IceCream,
        iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        topBar: "bg-purple-500",
      },
      // TOTAL ENTRIES
      {
        label: "Total Entries",
        value: (stats?.totalEntries ?? 0).toString(),
        icon: ListOrdered,
        iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        topBar: "bg-emerald-500",
      },
      // YOGHURT SHARE — DERIVED INSIGHT STAT
      {
        label: "Yoghurt Share",
        value: `${(stats?.yoghurtSharePercent ?? 0).toLocaleString()}%`,
        icon: Percent,
        iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        topBar: "bg-amber-500",
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
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
MilkLogStatsCards.displayName = "MilkLogStatsCards";

// <== EXPORT ==>
export default MilkLogStatsCards;
