// <== IMPORTS ==>
import {
  Store,
  Milk,
  IceCream,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/types/settings-types";

// <== SETTINGS STATS CARDS PROPS ==>
interface SettingsStatsCardsProps {
  // <== FULL USER PROFILE FROM API ==>
  profile: UserProfile | undefined;
  // <== LOADING STATE ==>
  isLoading: boolean;
}

// <== STAT CARD DEFINITION TYPE ==>
type StatCard = {
  // <== STAT CARD LABEL ==>
  label: string;
  // <== STAT CARD VALUE ==>
  value: string;
  // <== STAT CARD ICON ==>
  icon: LucideIcon;
  // <== ICON COLOR CLASS ==>
  iconClass: string;
  // <== TOP BAR COLOR CLASS ==>
  topBar: string;
};

// <== SETTINGS STATS CARDS COMPONENT ==>
const SettingsStatsCards = memo(
  ({ profile, isLoading }: SettingsStatsCardsProps) => {
    // DETERMINE REPORTS STATUS — ENABLED IF EITHER DAILY OR MONTHLY IS ON
    const reportsEnabled =
      (profile?.dailyReportsEnabled ?? false) ||
      (profile?.monthlyReportsEnabled ?? false);
    // BUILD STAT CARDS FROM PROFILE DATA
    const cards: StatCard[] = [
      // SHOP STATUS
      {
        label: "Shop Status",
        value: "Active",
        icon: Store,
        iconClass: "bg-primary/10 text-primary",
        topBar: "bg-primary",
      },
      // MILK RATE
      {
        label: "Milk Rate",
        value: `₨${(profile?.milkRate ?? 120).toLocaleString()} / L`,
        icon: Milk,
        iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        topBar: "bg-blue-500",
      },
      // YOGHURT RATE
      {
        label: "Yoghurt Rate",
        value: `₨${(profile?.yoghurtRate ?? 180).toLocaleString()} / kg`,
        icon: IceCream,
        iconClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        topBar: "bg-purple-500",
      },
      // REPORTS STATUS — COLOR DEPENDS ON WHETHER REPORTS ARE ENABLED
      {
        label: "Reports",
        value: reportsEnabled ? "Enabled" : "Disabled",
        icon: BarChart3,
        iconClass: reportsEnabled
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        topBar: reportsEnabled ? "bg-emerald-500" : "bg-amber-500",
      },
    ];
    // RETURNING STATS GRID
    return (
      // STATS GRID — 2 COLS ON MOBILE, 4 COLS ON LG
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5 sm:mb-6">
        {/* MAPPING STAT CARDS */}
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
              className="glass-card p-4 md:p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
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
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3",
                  stat.iconClass,
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {/* LABEL */}
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {/* VALUE OR SKELETON */}
              {isLoading ? (
                <Skeleton className="h-6 sm:h-7 w-24 mt-1" />
              ) : (
                <p className="text-lg sm:text-xl font-bold font-display mt-0.5 truncate">
                  {stat.value}
                </p>
              )}
              {/* DECORATIVE CIRCLE */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
SettingsStatsCards.displayName = "SettingsStatsCards";

// <== EXPORT ==>
export default SettingsStatsCards;
