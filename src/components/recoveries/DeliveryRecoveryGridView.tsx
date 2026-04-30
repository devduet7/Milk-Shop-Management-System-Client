// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { DeliveryRecovery } from "@/types/recovery-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== DELIVERY RECOVERY GRID VIEW PROPS ==>
interface DeliveryRecoveryGridViewProps {
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

// <== DELIVERY RECOVERY GRID VIEW COMPONENT ==>
const DeliveryRecoveryGridView = memo(
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
  }: DeliveryRecoveryGridViewProps) => {
    // RETURNING GRID VIEW
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* LOADING SKELETON CARDS */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-${i}`} className="glass-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-3 w-10 ml-auto" />
                </div>
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          {/* DATA CARDS */}
          {!isLoading &&
            // LOPPING THROUGH DELIVERY RECOVERY RECORDS
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
              // RETURNING GRID CARD
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 flex flex-col hover:shadow-md transition-all"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* CUSTOMER AVATAR */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm sm:text-base font-bold text-primary">
                          {r.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* CUSTOMER NAME + BILLING MONTH */}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate">
                          {r.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {r.monthlyStats.month}
                        </p>
                      </div>
                    </div>
                    {/* STATUS BADGE */}
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-bold tracking-wider uppercase shrink-0 ml-2",
                        isCleared
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                      )}
                    >
                      {isCleared ? "CLEARED" : "PENDING"}
                    </Badge>
                  </div>
                  {/* MONTH TOTAL + PAID MINI STATS */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Month Total
                      </p>
                      <p className="font-display text-base font-bold">
                        ₨{r.monthlyStats.monthlyTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Month Paid
                      </p>
                      <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                        ₨{r.monthlyStats.totalPaid.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* PENDING AMOUNT */}
                  {!isCleared && (
                    <div className="bg-red-500/10 rounded-lg p-2.5 mb-3 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Pending
                      </p>
                      <p className="font-display text-base font-bold text-red-600 dark:text-red-400">
                        ₨{r.monthlyStats.pending.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {/* PROGRESS BAR */}
                  <div className="mb-3 mt-auto">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        Recovery
                      </span>
                      <span className="text-xs font-semibold">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  {/* ALL-TIME OUTSTANDING */}
                  {r.allTimeOutstanding > 0 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      All-time outstanding:{" "}
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        ₨{r.allTimeOutstanding.toLocaleString()}
                      </span>
                    </p>
                  )}
                  {/* ACTION BUTTON */}
                  <Button
                    variant={isCleared ? "outline" : "default"}
                    size="sm"
                    className="w-full h-9 text-xs gap-1.5"
                    onClick={() => onRecordPayment(r)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {isCleared ? "Record Additional Payment" : "Record Payment"}
                  </Button>
                </motion.div>
              );
            })}
        </div>
        {/* EMPTY STATE */}
        {!isLoading && records.length === 0 && (
          <div className="glass-card flex flex-col items-center justify-center py-14 sm:py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-muted-foreground/40" />
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
          <div className="glass-card mt-0">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              totalFiltered={totalFiltered}
              startIndex={startIndex}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </div>
        )}
      </motion.div>
    );
  },
);

// <== DISPLAY NAME FOR DEVTOOLS ==>
DeliveryRecoveryGridView.displayName = "DeliveryRecoveryGridView";

// <== EXPORT ==>
export default DeliveryRecoveryGridView;
