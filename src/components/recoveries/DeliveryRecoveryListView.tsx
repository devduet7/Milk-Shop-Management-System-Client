// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Edit, RefreshCw, Calendar } from "lucide-react";
import type { DeliveryRecovery } from "@/types/recovery-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== DELIVERY RECOVERY LIST VIEW PROPS ==>
interface DeliveryRecoveryListViewProps {
  // <== PAGINATED DELIVERY RECOVERY RECORDS ==>
  records: DeliveryRecovery[];
  // <== TOTAL FILTERED COUNT ==>
  totalFiltered: number;
  // <== LOADING STATE ==>
  isLoading: boolean;
  // <== CURRENT PAGE ==>
  currentPage: number;
  // <== ROWS PER PAGE ==>
  rowsPerPage: number;
  // <== START INDEX ==>
  startIndex: number;
  // <== TOTAL PAGES ==>
  totalPages: number;
  // <== PAGE CHANGE HANDLER ==>
  onPageChange: (page: number) => void;
  // <== ROWS PER PAGE CHANGE HANDLER ==>
  onRowsPerPageChange: (value: string) => void;
  // <== RECORD PAYMENT HANDLER ==>
  onRecordPayment: (record: DeliveryRecovery) => void;
}

// <== DELIVERY RECOVERY LIST VIEW COMPONENT ==>
const DeliveryRecoveryListView = memo(
  ({
    records,
    totalFiltered,
    isLoading,
    currentPage,
    rowsPerPage,
    startIndex,
    totalPages,
    onPageChange,
    onRowsPerPageChange,
    onRecordPayment,
  }: DeliveryRecoveryListViewProps) => {
    // RETURNING LIST VIEW
    return (
      // LIST CARD WRAPPER
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* LIST ITEMS */}
        <div className="divide-y divide-border/50">
          {/* LOADING SKELETONS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="p-3 sm:p-4 flex items-center gap-3"
              >
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="shrink-0 hidden sm:block space-y-1.5">
                  <Skeleton className="h-2 w-20 rounded-full" />
                  <Skeleton className="h-3 w-14 ml-auto" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md shrink-0" />
              </div>
            ))}
          {/* DATA ROWS */}
          {!isLoading &&
            // LOOPING THROUGH DELIVERY RECOVERY RECORDS
            records.map((r, i) => {
              // COMPUTE MONTH RECOVERY PERCENTAGE
              const pct =
                r.monthlyStats.monthlyTotal > 0
                  ? Math.min(
                      100,
                      (r.monthlyStats.totalPaid / r.monthlyStats.monthlyTotal) *
                        100,
                    )
                  : 100;
              // IS CLEARED FOR THIS BILLING MONTH
              const isCleared = r.monthlyStats.pending === 0;
              // RETURNING LIST ITEM
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  {/* CUSTOMER AVATAR */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    {/* CUSTOMER NAME + STATUS BADGE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {r.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase shrink-0",
                          isCleared
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                        )}
                      >
                        {isCleared
                          ? "CLEARED"
                          : `₨${r.monthlyStats.pending.toLocaleString()} DUE`}
                      </Badge>
                    </div>
                    {/* BILLING MONTH + PAID INFO */}
                    <div className="flex items-center flex-wrap gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {r.monthlyStats.month}
                      </span>
                      <span>
                        ₨{r.monthlyStats.totalPaid.toLocaleString()} of ₨
                        {r.monthlyStats.monthlyTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {/* PROGRESS + ALL-TIME — HIDDEN ON VERY SMALL */}
                  <div className="shrink-0 hidden sm:block text-right min-w-[80px]">
                    <Progress value={pct} className="h-1.5 w-20 ml-auto" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {pct.toFixed(0)}%
                    </p>
                  </div>
                  {/* ACTION BUTTON */}
                  <Button
                    variant={isCleared ? "outline" : "default"}
                    size="sm"
                    className="h-8 text-xs gap-1.5 shrink-0"
                    onClick={() => onRecordPayment(r)}
                  >
                    <Edit className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {isCleared ? "Payment" : "Record"}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-sm">
                No delivery recoveries found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Customers with pending balances will appear here
              </p>
            </div>
          </div>
        )}
        {/* PAGINATION */}
        {!isLoading && totalFiltered > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalFiltered={totalFiltered}
            startIndex={startIndex}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        )}
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DeliveryRecoveryListView.displayName = "DeliveryRecoveryListView";

// <== EXPORT ==>
export default DeliveryRecoveryListView;
