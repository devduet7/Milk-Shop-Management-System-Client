// <== IMPORTS ==>
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { DeliveryRecovery } from "@/types/recovery-types";
import PaginationControls from "@/components/common/PaginationControls";

// <== DELIVERY RECOVERY TABLE VIEW PROPS ==>
interface DeliveryRecoveryTableViewProps {
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

// <== DELIVERY RECOVERY TABLE VIEW COMPONENT ==>
const DeliveryRecoveryTableView = memo(
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
  }: DeliveryRecoveryTableViewProps) => {
    // RETURNING TABLE VIEW
    return (
      // TABLE CARD WRAPPER
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        {/* SCROLLABLE TABLE CONTAINER */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            {/* STICKY TABLE HEADER */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border text-left bg-muted/50 backdrop-blur-sm">
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Month Total
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Month Paid
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Month Pending
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">
                  All-Time Due
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">
                  Progress
                </th>
                <th className="px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            {/* TABLE BODY */}
            <tbody>
              {/* LOADING SKELETON ROWS */}
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="border-b border-border/50">
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-24 mb-1.5" />
                      <Skeleton className="h-3 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-14" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <Skeleton className="h-2 w-20 rounded-full" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-8 w-28 rounded-md" />
                    </td>
                  </tr>
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
                          (r.monthlyStats.totalPaid /
                            r.monthlyStats.monthlyTotal) *
                            100,
                        )
                      : 100;
                  // IS CLEARED FOR THIS BILLING MONTH
                  const isCleared = r.monthlyStats.pending === 0;
                  // RETURNING TABLE ROW
                  return (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {/* CUSTOMER NAME + PHONE */}
                      <td className="px-3 py-3">
                        <div className="font-medium text-sm">{r.name}</div>
                        {r.phone && (
                          <div className="text-xs text-muted-foreground hidden md:block">
                            {r.phone}
                          </div>
                        )}
                      </td>
                      {/* MONTH TOTAL — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm hidden sm:table-cell">
                        ₨{r.monthlyStats.monthlyTotal.toLocaleString()}
                      </td>
                      {/* MONTH PAID — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">
                        ₨{r.monthlyStats.totalPaid.toLocaleString()}
                      </td>
                      {/* MONTH PENDING BADGE */}
                      <td className="px-3 py-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-bold tracking-wider uppercase whitespace-nowrap",
                            isCleared
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
                          )}
                        >
                          {isCleared
                            ? "CLEARED"
                            : `₨${r.monthlyStats.pending.toLocaleString()} DUE`}
                        </Badge>
                      </td>
                      {/* ALL-TIME OUTSTANDING — HIDDEN ON MEDIUM */}
                      <td className="px-3 py-3 text-sm hidden md:table-cell">
                        {r.allTimeOutstanding > 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            ₨{r.allTimeOutstanding.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ₨0
                          </span>
                        )}
                      </td>
                      {/* PROGRESS BAR — HIDDEN ON SMALL */}
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      {/* ACTION BUTTON */}
                      <td className="px-3 py-3">
                        <Button
                          variant={isCleared ? "outline" : "default"}
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => onRecordPayment(r)}
                        >
                          <Edit className="w-3 h-3" />
                          {isCleared ? "Payment" : "Record"}
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
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
        </div>
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
DeliveryRecoveryTableView.displayName = "DeliveryRecoveryTableView";

// <== EXPORT ==>
export default DeliveryRecoveryTableView;
