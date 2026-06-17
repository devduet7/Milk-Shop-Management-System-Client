// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, ArrowUpRight } from "lucide-react";
import type { DashboardRecoveryStats } from "@/types/dashboard-types";

// <== RECOVERY SECTION PROPS ==>
interface RecoverySectionProps {
  // <== STATS ==>
  stats: DashboardRecoveryStats | undefined;
  // <== IS LOADING ==>
  isLoading: boolean;
}

// <== RECOVERY SECTION COMPONENT ==>
const RecoverySection = memo(({ stats, isLoading }: RecoverySectionProps) => {
  // NAVIGATE HOOK
  const navigate = useNavigate();
  // RETURNING RECOVERY SECTION
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* GRADIENT HEADER */}
      <div className="px-4 sm:px-5 py-4 border-b border-border/50 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500/8 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          {/* ICON BADGE */}
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-amber-500/20">
            <RefreshCw className="w-[17px] h-[17px] text-amber-600 dark:text-amber-400" />
          </div>
          {/* TITLE AND SUBTITLE */}
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-sm sm:text-base leading-tight">
              Outstanding Recovery
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              All-time combined outstanding balances
            </p>
          </div>
        </div>
        {/* VIEW ALL LINK */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1 shrink-0"
          onClick={() => navigate("/recoveries")}
        >
          View All
          <ArrowUpRight className="w-3 h-3" />
        </Button>
      </div>
      {/* BODY */}
      <div className="p-4 sm:p-5">
        {/* STAT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {/* TOTAL OUTSTANDING */}
          <div className="bg-red-500/10 rounded-xl p-3 text-center ring-1 ring-red-500/15">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Total Outstanding
            </p>
            {isLoading ? (
              <Skeleton className="h-5 w-16 mx-auto" />
            ) : (
              <p className="font-display font-bold text-sm text-red-600 dark:text-red-400">
                ₨{(stats?.totalOutstanding ?? 0).toLocaleString()}
              </p>
            )}
          </div>
          {/* DELIVERY OUTSTANDING */}
          <div className="bg-muted/40 rounded-xl p-3 text-center ring-1 ring-border/50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Delivery Pending
            </p>
            {isLoading ? (
              <Skeleton className="h-5 w-16 mx-auto" />
            ) : (
              <p className="font-display font-bold text-sm">
                ₨{(stats?.deliveryOutstanding ?? 0).toLocaleString()}
              </p>
            )}
          </div>
          {/* SALES OUTSTANDING */}
          <div className="bg-muted/40 rounded-xl p-3 text-center ring-1 ring-border/50">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Sales Pending
            </p>
            {isLoading ? (
              <Skeleton className="h-5 w-16 mx-auto" />
            ) : (
              <p className="font-display font-bold text-sm">
                ₨{(stats?.salesOutstanding ?? 0).toLocaleString()}
              </p>
            )}
          </div>
          {/* RECOVERY RATE */}
          <div
            className={cn(
              "rounded-xl p-3 text-center ring-1",
              (stats?.recoveryRate ?? 0) >= 70
                ? "bg-emerald-500/10 ring-emerald-500/15"
                : "bg-amber-500/10 ring-amber-500/15",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Recovery Rate
            </p>
            {isLoading ? (
              <Skeleton className="h-5 w-16 mx-auto" />
            ) : (
              <p
                className={cn(
                  "font-display font-bold text-sm",
                  (stats?.recoveryRate ?? 0) >= 70
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              >
                {(stats?.recoveryRate ?? 0).toFixed(1)}%
              </p>
            )}
          </div>
        </div>
        {/* RECOVERY RATE PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              ₨{(stats?.totalAllTimePaid ?? 0).toLocaleString()} collected of ₨
              {(stats?.totalAllTimeDue ?? 0).toLocaleString()} total due
            </span>
            <span className="font-semibold text-foreground">
              {(stats?.recoveryRate ?? 0).toFixed(1)}%
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-2 w-full rounded-full" />
          ) : (
            <Progress value={stats?.recoveryRate ?? 0} className="h-2" />
          )}
        </div>
      </div>
    </motion.div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
RecoverySection.displayName = "RecoverySection";

// <== EXPORT ==>
export default RecoverySection;
