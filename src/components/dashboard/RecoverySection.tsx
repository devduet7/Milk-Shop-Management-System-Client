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
      className="glass-card p-4 sm:p-5"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm sm:text-base">
              Outstanding Recovery
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              All-time combined outstanding balances
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground gap-1"
          onClick={() => navigate("/recoveries")}
        >
          View All
          <ArrowUpRight className="w-3 h-3" />
        </Button>
      </div>
      {/* STAT GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* TOTAL OUTSTANDING */}
        <div className="bg-red-500/10 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">
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
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">
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
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">
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
            "rounded-xl p-3 text-center",
            (stats?.recoveryRate ?? 0) >= 70
              ? "bg-emerald-500/10"
              : "bg-amber-500/10",
          )}
        >
          <p className="text-[10px] text-muted-foreground mb-1">
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
    </motion.div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
RecoverySection.displayName = "RecoverySection";

// <== EXPORT ==>
export default RecoverySection;
