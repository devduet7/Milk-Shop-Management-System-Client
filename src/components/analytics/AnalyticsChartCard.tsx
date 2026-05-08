// <== IMPORTS ==>
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { memo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// <== ANALYTICS CHART CARD PROPS ==>
interface AnalyticsChartCardProps {
  // <== CARD TITLE ==>
  title: string;
  // <== OPTIONAL SUBTITLE ==>
  subtitle?: string;
  // <== LUCIDE ICON ==>
  icon: LucideIcon;
  // <== ICON CONTAINER CLASS ==>
  iconClass?: string;
  // <== OPTIONAL BADGE LABEL ==>
  badge?: string;
  // <== OPTIONAL BADGE CLASS ==>
  badgeClass?: string;
  // <== IS DATA LOADING ==>
  isLoading: boolean;
  // <== CHART HEIGHT IN PIXELS ==>
  chartHeight?: number;
  // <== MOTION ANIMATION DELAY ==>
  animDelay?: number;
  // <== CHART CHILDREN ==>
  children: ReactNode;
}

// <== ANALYTICS CHART CARD COMPONENT ==>
const AnalyticsChartCard = memo(
  ({
    title,
    subtitle,
    icon: Icon,
    iconClass = "bg-primary/10 text-primary",
    badge,
    badgeClass = "bg-muted/60 text-muted-foreground",
    isLoading,
    chartHeight = 240,
    animDelay = 0,
    children,
  }: AnalyticsChartCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.25 }}
      className="glass-card overflow-hidden"
    >
      {/* CARD HEADER */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 flex items-start justify-between gap-3">
        {/* LEFT: ICON + TITLE + SUBTITLE */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              iconClass,
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-sm sm:text-base leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {/* RIGHT: BADGE */}
        {badge && (
          <span
            className={cn(
              "text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0",
              badgeClass,
            )}
          >
            {badge}
          </span>
        )}
      </div>
      {/* CHART BODY */}
      <div className="px-2 pb-4">
        {isLoading ? (
          // LOADING SKELETON
          <Skeleton
            style={{ height: chartHeight }}
            className="w-full rounded-xl mx-2"
          />
        ) : (
          children
        )}
      </div>
    </motion.div>
  ),
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
AnalyticsChartCard.displayName = "AnalyticsChartCard";

// <== EXPORT ==>
export default AnalyticsChartCard;
